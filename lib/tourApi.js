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

function formatYmd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

// 지금 진행 중이거나, daysAhead일 안에 시작하는 축제를 전국 기준으로 가져와서
// 오늘과 가까운 순으로 반환 (진행중은 항상 최상단)
// 기간이 비정상적으로 긴 것(연중 상시 운영되는 "축제" 명목의 상설전시 등)은 제외한다
// 전국 단위라 한 페이지(최대 100개)로 안 끝날 수 있어 필요시 페이지를 추가로 가져온다
export async function searchAllFestivals(daysAhead = 14, maxItems = 400) {
  const serviceKey = process.env.TOUR_API_KEY;
  if (!serviceKey) {
    return [];
  }

  const today = new Date();
  const rangeEnd = new Date();
  rangeEnd.setDate(rangeEnd.getDate() + daysAhead);

  const perPage = 100;

  function buildUrl(pageNo) {
    const params = new URLSearchParams({
      serviceKey,
      MobileOS: "ETC",
      MobileApp: "jecheolnow",
      _type: "json",
      numOfRows: String(perPage),
      pageNo: String(pageNo),
      eventStartDate: formatYmd(today),
      eventEndDate: formatYmd(rangeEnd),
    });
    return `${TOUR_API_BASE}/searchFestival2?${params.toString()}`;
  }

  try {
    const firstRes = await fetch(buildUrl(1), { next: { revalidate: 3600 } });
    if (!firstRes.ok) {
      console.error("[TourAPI] 응답 실패:", firstRes.status);
      return [];
    }
    const firstData = await firstRes.json();
    const body = firstData?.response?.body;
    const totalCount = body?.totalCount || 0;
    const firstItems = body?.items?.item;
    let allItems = firstItems ? (Array.isArray(firstItems) ? firstItems : [firstItems]) : [];

    console.error(`[TourAPI] 전체 ${totalCount}건 중 ${allItems.length}건 수신 (1페이지)`);

    // 남은 페이지를 필요한 만큼(maxItems 한도 내에서) 추가로 가져옴
    const totalPages = Math.min(Math.ceil(totalCount / perPage), Math.ceil(maxItems / perPage));
    if (totalPages > 1) {
      const restPages = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, i) => i + 2).map(async (pageNo) => {
          const res = await fetch(buildUrl(pageNo), { next: { revalidate: 3600 } });
          if (!res.ok) return [];
          const data = await res.json();
          const items = data?.response?.body?.items?.item;
          return items ? (Array.isArray(items) ? items : [items]) : [];
        })
      );
      allItems = allItems.concat(restPages.flat());
      console.error(`[TourAPI] 페이지네이션 후 총 ${allItems.length}건 확보`);
    }

    const nowTime = today.getTime();
    const MAX_DURATION_DAYS = 90; // 이보다 길면 "연중 상시" 성격으로 보고 제외

    const parsed = allItems
      .map((item) => {
        const startObj = parseYmd(item.eventstartdate);
        const endObj = parseYmd(item.eventenddate);
        if (!startObj) return null;

        if (endObj) {
          const durationDays = (endObj - startObj) / (1000 * 60 * 60 * 24);
          if (durationDays > MAX_DURATION_DAYS) return null; // 연중 상시 축제 제외
        }

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
      .filter(Boolean);

    // 진행중 우선, 그다음은 오늘과 가까운 시작일 순
    parsed.sort((a, b) => {
      const pa = a.status === "진행중" ? 0 : 1;
      const pb = b.status === "진행중" ? 0 : 1;
      if (pa !== pb) return pa - pb;
      return Math.abs(a.startTime - nowTime) - Math.abs(b.startTime - nowTime);
    });

    return parsed;
  } catch (e) {
    console.error("[TourAPI] 호출 에러:", e);
    return [];
  }
}
