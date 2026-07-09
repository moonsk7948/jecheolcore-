// 한국관광공사 TourAPI(KorService2) 연동
const TOUR_API_BASE = "https://apis.data.go.kr/B551011/KorService2";

function formatYmd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

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

// 지금 진행 중이거나, daysAhead일 안에 시작하는 축제를 전국 기준으로 가져온다
// (제철 음식과 무관하게 독립적으로 노출 — 미리 계획할 수 있도록 시작 2주 전부터 노출)
// 오늘과 가장 가까운 시작일 순으로 정렬해서 반환
export async function searchFestivalsInRange(daysAhead = 14, numOfRows = 20) {
  const serviceKey = process.env.TOUR_API_KEY;
  if (!serviceKey) {
    return [];
  }

  const today = new Date();
  const rangeEnd = new Date();
  rangeEnd.setDate(rangeEnd.getDate() + daysAhead);

  const params = new URLSearchParams({
    serviceKey,
    MobileOS: "ETC",
    MobileApp: "jecheolnow",
    _type: "json",
    numOfRows: String(numOfRows),
    pageNo: "1",
    eventStartDate: formatYmd(today), // 오늘 기준 아직 안 끝난 축제부터
    eventEndDate: formatYmd(rangeEnd), // daysAhead 이내에 시작하는 것까지
  });

  const url = `${TOUR_API_BASE}/searchFestival2?${params.toString()}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.error("[TourAPI] 응답 실패:", res.status, url);
      return [];
    }
    const data = await res.json();
    const items = data?.response?.body?.items?.item;
    if (!items) {
      console.error("[TourAPI] item 없음:", JSON.stringify(data).slice(0, 300));
      return [];
    }

    const list = Array.isArray(items) ? items : [items];
    const todayTime = today.getTime();

    const parsed = list
      .map((item) => {
        const startObj = parseYmd(item.eventstartdate);
        const endObj = parseYmd(item.eventenddate);
        if (!startObj) return null;

        const status = endObj && endObj >= today && startObj <= today ? "진행중" : "예정";

        return {
          title: item.title,
          addr: item.addr1 || "",
          contentId: item.contentid,
          period: endObj ? `${formatDisplay(startObj)} ~ ${formatDisplay(endObj)}` : formatDisplay(startObj),
          status,
          startTime: startObj.getTime(),
        };
      })
      .filter(Boolean);

    // 오늘과 가장 가까운 시작일 순
    parsed.sort((a, b) => Math.abs(a.startTime - todayTime) - Math.abs(b.startTime - todayTime));

    return parsed;
  } catch (e) {
    console.error("[TourAPI] 호출 에러:", e);
    return [];
  }
}
