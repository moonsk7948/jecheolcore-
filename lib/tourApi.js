// 한국관광공사 TourAPI(KorService2) 연동
// contentTypeId=15 : 축제/공연/행사
const TOUR_API_BASE = "https://apis.data.go.kr/B551011/KorService2";

// YYYYMMDD -> "M.D" 형식으로 변환
function formatDate(yyyymmdd) {
  if (!yyyymmdd || yyyymmdd.length !== 8) return null;
  const month = parseInt(yyyymmdd.slice(4, 6), 10);
  const day = parseInt(yyyymmdd.slice(6, 8), 10);
  return `${month}.${day}`;
}

// 특정 축제(contentId)의 실제 시작~종료일 조회
async function getFestivalPeriod(serviceKey, contentId) {
  const params = new URLSearchParams({
    serviceKey,
    MobileOS: "ETC",
    MobileApp: "jecheolcore",
    _type: "json",
    contentId,
    contentTypeId: "15",
  });

  try {
    const res = await fetch(`${TOUR_API_BASE}/detailIntro2?${params.toString()}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const item = data?.response?.body?.items?.item;
    const info = Array.isArray(item) ? item[0] : item;
    if (!info) return null;

    const start = formatDate(info.eventstartdate);
    const end = formatDate(info.eventenddate);
    if (start && end) return `${start} ~ ${end}`;
    if (start) return `${start}부터`;
    return null;
  } catch (e) {
    console.error("TourAPI 상세조회 에러:", e);
    return null;
  }
}

// keyword(보통 음식 이름)로 축제 검색
// " 축제" 등을 붙이지 않고 음식 이름만 넣는 게 매칭률이 훨씬 높다
// (contentTypeId=15로 이미 축제/공연/행사로 필터링되어 있음)
export async function searchFestivalsByKeyword(keyword, numOfRows = 2) {
  const serviceKey = process.env.TOUR_API_KEY;
  if (!serviceKey) {
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

    // 각 축제의 실제 기간을 병렬로 조회
    const withPeriod = await Promise.all(
      list.map(async (item) => ({
        title: item.title,
        addr: item.addr1 || "",
        contentId: item.contentid,
        period: await getFestivalPeriod(serviceKey, item.contentid),
      }))
    );

    return withPeriod;
  } catch (e) {
    console.error("TourAPI 호출 에러:", e);
    return [];
  }
}
