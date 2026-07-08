// 네이버 쇼핑 검색 API 연동
// 정확도순(sim) 정렬 = 네이버 랭킹과 가장 유사한 지표
const NAVER_SHOP_URL = "https://openapi.naver.com/v1/search/shop.json";

// item.link(개별 판매자/스마트스토어 URL), catalog URL 둘 다 경우에 따라 로그인을 요구해서 신뢰할 수 없음.
// 대신 상품명으로 네이버쇼핑 "검색결과" 페이지로 보낸다 — 검색결과 목록은 로그인 없이 항상 공개.
function buildProductUrl(title) {
  return `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(title)}`;
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

    return (data.items || []).map((item, idx) => {
      const cleanName = item.title.replace(/<\/?b>/g, ""); // 검색어 강조용 <b> 태그 제거
      return {
        name: cleanName,
        source: item.mallName || "네이버쇼핑",
        price: Number(item.lprice) || 0,
        url: buildProductUrl(cleanName),
        image: item.image || null,
        slotType: "auto",
        rankSource: "네이버",
        rank: idx + 1,
      };
    });
  } catch (e) {
    console.error("네이버 쇼핑 API 호출 에러:", e);
    return [];
  }
}
