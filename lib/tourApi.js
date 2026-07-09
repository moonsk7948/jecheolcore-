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

// TourAPI가 "이건 음식 축제다"라고 분류해주는 공식 필드가 없어서,
// 제목에 흔한 농수산물/먹거리 키워드가 포함되어 있는지로 필터링한다.
// (완벽하진 않지만 대부분의 지역 먹거리 축제는 "OO+품목명+축제" 형태라 상당수 잡힌다)
const FOOD_KEYWORDS = [
  // 과일
  "딸기", "사과", "배", "포도", "복숭아", "자두", "참외", "수박", "멜론", "감귤", "한라봉",
  "블루베리", "체리", "무화과", "석류", "곶감", "감",
  // 채소/농산물
  "감자", "고구마", "옥수수", "배추", "무", "양파", "마늘", "고추", "파", "버섯", "산나물", "나물",
  "쌀", "보리", "콩", "팥", "인삼", "더덕", "우엉", "연근", "토마토",
  // 수산물
  "전복", "굴", "새우", "대게", "꽃게", "조개", "멸치", "갈치", "고등어", "참치", "문어", "낙지",
  "미역", "다시마", "김", "장어", "붕어", "메기", "송어", "민어", "우럭", "광어",
  // 축산/가공식품
  "한우", "흑돼지", "돼지", "닭", "오리", "막걸리", "와인", "젓갈", "떡", "한과", "된장", "고추장",
  // 일반 먹거리 표현
  "먹거리", "미식", "음식", "푸드", "food", "Food", "맛", "요리", "농산물", "수산물", "특산물",
  "향토음식", "전통음식", "장터", "먹방", "미각",
];

function isFoodRelated(title) {
  return FOOD_KEYWORDS.some((kw) => title.includes(kw));
}

// 지금 진행 중이거나, daysAhead일 안에 시작하는 "먹거리 관련" 축제를
// 전국 기준으로 가져와서 오늘과 가까운 순으로 반환 (진행중은 항상 최상단)
export async function searchFoodFestivals(daysAhead = 14, numOfRows = 100) {
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
    eventStartDate: formatYmd(today),
    eventEndDate: formatYmd(rangeEnd),
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
    const nowTime = today.getTime();

    const parsed = list
      .filter((item) => isFoodRelated(item.title || ""))
      .map((item) => {
        const startObj = parseYmd(item.eventstartdate);
        const endObj = parseYmd(item.eventenddate);
        if (!startObj) return null;

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
