// 제철 음식 데이터
// startTerm/peakTerm/endTerm: 24절기 순번(0~23), lib/solarTerms.js의 SOLAR_TERMS 인덱스 참고
//   0입춘 1우수 2경칩 3춘분 4청명 5곡우 6입하 7소만 8망종 9하지 10소서 11대서
//   12입추 13처서 14백로 15추분 16한로 17상강 18입동 19소설 20대설 21동지 22소한 23대한
//
// gonggu: 실제 셀러와 계약이 성사된 유료 상단 슬롯. 계약 전까지는 빈 배열로 둔다.
//         (여기 들어가는 데이터는 크롤링/API가 아니라 직접 큐레이션 + 계약 기반이라 수동 관리)
export const FOODS = {
  corn: {
    name: "옥수수",
    emoji: "🌽",
    startTerm: 9,
    peakTerm: 11,
    endTerm: 12,
    why: "단맛이 가장 오른 시기예요. 알이 꽉 차고 수염이 갈색일수록 신선해요.",
    gonggu: [],
  },
  peach: {
    name: "복숭아",
    emoji: "🍑",
    startTerm: 9,
    peakTerm: 12,
    endTerm: 14,
    why: "당도가 오르기 시작하는 초입이에요. 향이 진하고 꼭지 주변이 붉을수록 좋아요.",
    gonggu: [],
  },
  potato: {
    name: "감자",
    emoji: "🥔",
    startTerm: 7,
    peakTerm: 9,
    endTerm: 10,
    why: "수확 막바지라 저장성이 가장 좋은 시기예요. 표면이 매끈한 것을 고르세요.",
    gonggu: [],
  },
  abalone: {
    name: "전복",
    emoji: "🦪",
    startTerm: 9,
    peakTerm: 11,
    endTerm: 13,
    why: "살이 오르기 시작하는 초입이에요. 껍데기 광택이 있고 입을 다무는 게 신선해요.",
    gonggu: [],
  },
  blueberry: {
    name: "블루베리",
    emoji: "🫐",
    startTerm: 9,
    peakTerm: 11,
    endTerm: 12,
    why: "당도와 색이 가장 진한 절정기예요. 표면에 하얀 분(果粉)이 있는 게 신선해요.",
    gonggu: [],
  },
  plum: {
    name: "자두",
    emoji: "🍈",
    startTerm: 9,
    peakTerm: 12,
    endTerm: 14,
    why: "새콤달콤한 맛이 막 올라오는 시기예요. 껍질에 탄력이 있는 걸 고르세요.",
    gonggu: [],
  },
  croaker: {
    name: "민어",
    emoji: "🐟",
    startTerm: 9,
    peakTerm: 11,
    endTerm: 13,
    why: "여름 보양식 절정기예요. 살이 단단하고 윤기가 도는 걸 고르세요.",
    gonggu: [],
  },
};

// 상품 정렬 로직: 공구(gonggu) 최상단 고정 → 자동추천(auto, 네이버 랭킹 순)
export function sortProducts(gonggu, auto) {
  return [...gonggu, ...auto.sort((a, b) => (a.rank || 999) - (b.rank || 999))];
}
