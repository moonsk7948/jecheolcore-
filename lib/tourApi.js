// 한국관광공사 TourAPI(KorService2) 연동
const TOUR_API_BASE = "https://apis.data.go.kr/B551011/KorService2";

// "YYYYMMDD" -> Date
function parseYmd(str) {
  if (!str || str.length !== 8) return null;
  const y = parseInt(str.slice(0, 4), 10);
  const m = parseInt(str.slice(4, 6), 10) - 1;
  const d = parseInt(str.slice(6, 8), 10);
  return new Date(y, m, d);
}

// Date -> "M.D"
function formatDisplay(date) {
  return `${date.getMonth() + 1}.${date.getDate()}`;
}

// 특정 축제(contentId)의 실제 시작~종료일 조회
async function getFestivalDates(serviceKey, contentId) {
  const params = new URLSearchParams({
    serviceKey,
    MobileOS: "ETC",
    MobileApp: "jecheolnow",
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

    return {
      startObj: parseYmd(info.eventstartdate),
      endObj: parseYmd(info.eventenddate),
    };
  } catch (e) {
    console.error("[TourAPI] 상세조회 에러:", e);
    return null;
  }
}

// keyword(음식 이름)로 축제 검색, 각 축제의 실제 기간/상태까지 함께 반환
// " 축제" 등을 붙이지 않고 음식 이름만 넣는 게 매칭률이 훨씬 높다
export async function searchFestivalsByKeyword(keyword, numOfRows = 3) {
  const serviceKey = process.env.TOUR_API_KEY;
  if (!serviceKey) {
    return [];
  }

  const params = new URLSearchParams({
    serviceKey,
    MobileOS: "ETC",
    MobileApp: "jecheolnow",
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
      console.error("[TourAPI] 응답 실패:", res.status, url);
      return [];
    }
    const data = await res.json();
    const items = data?.response?.body?.items?.item;
    if (!items) return [];

    const list = Array.isArray(items) ? items : [items];
    const today = new Date();

    const withDates = await Promise.all(
      list.map(async (item) => {
        const dates = await getFestivalDates(serviceKey, item.contentid);
        const startObj = dates?.startObj;
        if (!startObj) return null;

        const endObj = dates?.endObj;
        const status = endObj && startObj <= today && endObj >= today ? "진행중" : "예정";

        return {
          title: item.title,
          addr: item.addr1 || "",
          contentId: item.contentid,
          period: endObj ? `${formatDisplay(startObj)} ~ ${formatDisplay(endObj)}` : formatDisplay(startObj),
          status,
          startTime: startObj.getTime(),
        };
      })
    );

    return withDates.filter(Boolean);
  } catch (e) {
    console.error("[TourAPI] 호출 에러:", e);
    return [];
  }
}
