// 24절기: 순번(0~23), 이름, 양력 고정일(월/일) — 매년 ±1일 오차 범위
export const SOLAR_TERMS = [
  { name: "입춘", month: 2, day: 4 },
  { name: "우수", month: 2, day: 19 },
  { name: "경칩", month: 3, day: 6 },
  { name: "춘분", month: 3, day: 21 },
  { name: "청명", month: 4, day: 5 },
  { name: "곡우", month: 4, day: 20 },
  { name: "입하", month: 5, day: 6 },
  { name: "소만", month: 5, day: 21 },
  { name: "망종", month: 6, day: 6 },
  { name: "하지", month: 6, day: 21 },
  { name: "소서", month: 7, day: 7 },
  { name: "대서", month: 7, day: 23 },
  { name: "입추", month: 8, day: 8 },
  { name: "처서", month: 8, day: 23 },
  { name: "백로", month: 9, day: 8 },
  { name: "추분", month: 9, day: 23 },
  { name: "한로", month: 10, day: 8 },
  { name: "상강", month: 10, day: 23 },
  { name: "입동", month: 11, day: 7 },
  { name: "소설", month: 11, day: 22 },
  { name: "대설", month: 12, day: 7 },
  { name: "동지", month: 12, day: 22 },
  { name: "소한", month: 1, day: 6 },
  { name: "대한", month: 1, day: 20 },
];

// 오늘이 24절기 순환(0~23) 중 어느 지점인지 계산
export function getTodaySolarTermInfo(date = new Date()) {
  const year = date.getFullYear();

  // 올해 기준 24절기 날짜 목록 생성 (소한/대한은 다음해 1월 케이스 주의)
  const termDates = SOLAR_TERMS.map((term, idx) => {
    // 절기 순번 22, 23(소한, 대한)은 "해가 바뀐 뒤 1월"이 아니라
    // 실제로는 같은 겨울 시즌의 연속이므로, 편의상 같은 year 기준으로 계산하고
    // 필요시 -1년 처리는 아래 로직에서 순환으로 커버한다.
    return {
      idx,
      name: term.name,
      date: new Date(year, term.month - 1, term.day),
    };
  });

  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // today 이전(또는 당일)인 절기 중 가장 늦은 것을 "현재 절기"로 판정
  let currentIdx = -1;
  for (let i = 0; i < termDates.length; i++) {
    if (termDates[i].date <= today) {
      currentIdx = i;
    }
  }

  // today가 연초라 아직 입춘 전이면(1/1~2/3), 작년 마지막 절기(대한, idx 23)가 현재 절기
  if (currentIdx === -1) {
    currentIdx = 23;
  }

  const nextIdx = (currentIdx + 1) % 24;
  const currentTermDate = termDates[currentIdx].date;
  let nextTermDate = termDates[nextIdx] ? termDates[nextIdx].date : null;

  // 다음 절기가 연도를 넘어가는 경우(예: 대한→입춘, 12월 절기→내년 1월 절기) 날짜 보정
  if (nextIdx === 0 && currentIdx === 23) {
    nextTermDate = new Date(year + 1, SOLAR_TERMS[0].month - 1, SOLAR_TERMS[0].day);
  } else if (nextTermDate && nextTermDate < currentTermDate) {
    nextTermDate = new Date(nextTermDate.getFullYear() + 1, nextTermDate.getMonth(), nextTermDate.getDate());
  }

  const daysToNext = nextTermDate
    ? Math.round((nextTermDate - today) / (1000 * 60 * 60 * 24))
    : null;

  return {
    currentIdx,
    currentName: SOLAR_TERMS[currentIdx].name,
    nextName: SOLAR_TERMS[nextIdx].name,
    daysToNext,
  };
}

// 순환(0~23) 거리 계산: from에서 to까지 "앞으로" 몇 칸인지
function forwardDistance(from, to) {
  return (to - from + 24) % 24;
}

// 제철 음식의 시작/절정/종료 절기 순번과 오늘의 절기 순번을 비교해
// '초입' / '절정' / '막바지' / '비제철' 판정
export function getStage(startIdx, peakIdx, endIdx, todayIdx) {
  const distFromStart = forwardDistance(startIdx, todayIdx);
  const totalSpan = forwardDistance(startIdx, endIdx);

  // 오늘이 제철 구간(시작~종료) 밖이면 비제철
  if (distFromStart > totalSpan) return null;

  const distFromPeak = Math.abs(forwardDistance(startIdx, todayIdx) - forwardDistance(startIdx, peakIdx));

  if (distFromPeak <= 1) return "절정";
  const peakOffset = forwardDistance(startIdx, peakIdx);
  return distFromStart < peakOffset ? "초입" : "막바지";
}
