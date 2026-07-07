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

// idx 22(소한), 23(대한)은 "입춘 기준 연도 + 1"의 1월에 해당한다.
// (24절기는 입춘에서 시작해 다음해 1월 대한에서 끝나는 순환 구조)
function buildCycleDates(cycleStartYear) {
  return SOLAR_TERMS.map((term, idx) => {
    const y = idx >= 22 ? cycleStartYear + 1 : cycleStartYear;
    return { idx, name: term.name, date: new Date(y, term.month - 1, term.day) };
  });
}

// 오늘이 24절기 순환 중 어느 지점인지 계산
export function getTodaySolarTermInfo(date = new Date()) {
  const year = date.getFullYear();
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // 올해 입춘보다 이전(1/1~2/3)이면, 아직 작년에 시작된 절기 순환 안에 있는 것
  const ipchunThisYear = new Date(year, SOLAR_TERMS[0].month - 1, SOLAR_TERMS[0].day);
  const cycleStartYear = today < ipchunThisYear ? year - 1 : year;

  const termDates = buildCycleDates(cycleStartYear);

  let currentIdx = 0;
  for (let i = 0; i < termDates.length; i++) {
    if (termDates[i].date <= today) {
      currentIdx = i;
    } else {
      break; // 배열이 날짜순으로 정렬되어 있으므로 여기서 멈춰도 안전
    }
  }

  const nextIdx = (currentIdx + 1) % 24;
  const nextTermDate =
    nextIdx === 0
      ? new Date(cycleStartYear + 1, SOLAR_TERMS[0].month - 1, SOLAR_TERMS[0].day)
      : termDates[nextIdx].date;

  const daysToNext = Math.round((nextTermDate - today) / (1000 * 60 * 60 * 24));

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
