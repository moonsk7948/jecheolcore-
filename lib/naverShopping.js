// 네이버 쇼핑 검색 API 연동
// 정확도순(sim) 정렬 = 네이버 랭킹과 가장 유사한 지표
const NAVER_SHOP_URL = "https://openapi.naver.com/v1/search/shop.json";

// smartstore.naver.com/main/products/{id} 형태는 브라우저에서 열면 로그인 화면으로 이어지는 경우가 있음.
// 하지만 검색엔진이 크롤링할 수 있도록, 페이지 HTML의 <head> 안에는 로그인 여부와 무관하게
// canonical/og:url 메타태그로 실제 스토어 URL(/{storeSlug}/products/{id})이 항상 박혀있음.
// 그 HTML을 서버에서 조용히 읽어서 실제 URL만 뽑아온다.
async function resolveSmartstoreCanonicalUrl(url) {
  if (!/smartstore\.naver\.com\/main\/products\//.test(url)) {
    return url;
  }

  try {
    const res = await fetch(url, {
      headers: {
        // 일반 브라우저처럼 보이도록 UA 지정 (일부 서버가 봇 UA에 다른 응답을 줄 수 있음)
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      },
      next: { revalidate: 3600 * 6 }, // 6시간 캐시
    });
    if (!res.ok) {
      console.error("[네이버] 스마트스토어 페이지 응답 실패:", res.status, url);
      return url;
    }

    const html = await res.text();

    const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
    const ogUrlMatch = html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i);

    const found = canonicalMatch?.[1] || ogUrlMatch?.[1];

    if (found && found.includes("/products/")) {
      return found;
    }

    console.error("[네이버] canonical/og:url 못 찾음. URL:", url);
    return url;
  } catch (e) {
    console.error("[네이버] 스마트스토어 URL 변환 에러:", url, e);
    return url;
  }
}

export async function searchNaverShopping(keyword, display = 4) {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return [];
  }

  const params = new URLSearchParams({
    query: keyword,
    display: String(display),
    sort: "sim",
  });

  try {
    const res = await fetch(`${NAVER_SHOP_URL}?${params.toString()}`, {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.error("네이버 쇼핑 API 응답 실패:", res.status);
      return [];
    }
    const data = await res.json();

    const items = (data.items || []).map((item, idx) => ({
      name: item.title.replace(/<\/?b>/g, ""), // 검색어 강조용 <b> 태그 제거
      source: item.mallName || "네이버쇼핑",
      price: Number(item.lprice) || 0,
      url: item.link,
      image: item.image || null,
      slotType: "auto",
      rankSource: "네이버",
      rank: idx + 1,
    }));

    // main/products 형태 링크만 실제 스토어 URL로 변환 (나머지는 그대로 통과)
    const resolved = await Promise.all(
      items.map(async (item) => ({ ...item, url: await resolveSmartstoreCanonicalUrl(item.url) }))
    );

    return resolved;
  } catch (e) {
    console.error("네이버 쇼핑 API 호출 에러:", e);
    return [];
  }
}
