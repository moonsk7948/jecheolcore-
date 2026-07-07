// 한국관광공사 TourAPI(KorService2) 연동
// contentTypeId=15 : 축제/공연/행사
const TOUR_API_BASE = "https://apis.data.go.kr/B551011/KorService2";

export async function searchFestivalsByKeyword(keyword, numOfRows = 2) {
  const serviceKey = process.env.TOUR_API_KEY;
  if (!serviceKey) {
    // 키가 설정 안 된 상태(로컬 테스트 등)에서는 조용히 빈 배열 반환
    return [];
  }

  const params = new URLSearchParams({
    serviceKey,
    MobileOS: "ETC",
    MobileApp: "jecheolcore",
    _type: "json",
    numOfRows: String(numOfRows),
    pageNo: "1",
    arrange: "Q", // 인기순
    keyword,
    contentTypeId: "15",
  });

  const url = `${TOUR_API_BASE}/searchKeyword2?${params.toString()}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.error("TourAPI 응답 실패:", res.status);
      return [];
    }
    const data = await res.json();
    const items = data?.response?.body?.items?.item;
    if (!items) return [];

    const list = Array.isArray(items) ? items : [items];

    return list.map((item) => ({
      title: item.title,
      addr: item.addr1 || "",
      contentId: item.contentid,
    }));
  } catch (e) {
    console.error("TourAPI 호출 에러:", e);
    return [];
  }
}
