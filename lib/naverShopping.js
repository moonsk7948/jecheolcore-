// 네이버 쇼핑 검색 API 연동
// 정확도순(sim) 정렬 = 네이버 랭킹과 가장 유사한 지표
const NAVER_SHOP_URL = "https://openapi.naver.com/v1/search/shop.json";

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

    return (data.items || []).map((item, idx) => ({
      name: item.title.replace(/<\/?b>/g, ""), // 검색어 강조용 <b> 태그 제거
      source: item.mallName || "네이버쇼핑",
      price: Number(item.lprice) || 0,
      url: item.link,
      image: item.image || null,
      slotType: "auto",
      rankSource: "네이버",
      rank: idx + 1,
    }));
  } catch (e) {
    console.error("네이버 쇼핑 API 호출 에러:", e);
    return [];
  }
}
