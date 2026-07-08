// 네이버 쇼핑 검색 API 연동
// 정확도순(sim) 정렬 = 네이버 랭킹과 가장 유사한 지표
const NAVER_SHOP_URL = "https://openapi.naver.com/v1/search/shop.json";

// smartstore.naver.com/main/products/{id} 형태는 종종 로그인 화면으로 이어짐
// 서버에서 미리 리다이렉트를 따라가서 실제 스토어 URL(/{storeSlug}/products/{id})로 바꿔준다
async function resolveSmartstoreLink(url) {
  if (!/smartstore\.naver\.com\/main\/products\//.test(url)) {
    return url;
  }

  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      next: { revalidate: 3600 * 6 }, // 6시간 캐시 (같은 상품 반복 조회 방지)
    });
    if (res.url && res.url !== url) {
      return res.url;
    }
    return url; // 리다이렉트가 안 됐으면 원래 링크라도 사용
  } catch (e) {
    console.error("[네이버] 스마트스토어 링크 변환 실패:", url, e);
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

    // 스마트스토어 임시 링크(main/products)만 골라 실제 URL로 변환
    const resolved = await Promise.all(
      items.map(async (item) => ({ ...item, url: await resolveSmartstoreLink(item.url) }))
    );

    return resolved;
  } catch (e) {
    console.error("네이버 쇼핑 API 호출 에러:", e);
    return [];
  }
}
