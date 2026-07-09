// 제철 음식 데이터
// startTerm/peakTerm/endTerm: 24절기 "이름"으로 직접 설정 (숫자 아님)
//   입춘 우수 경칩 춘분 청명 곡우 입하 소만 망종 하지 소서 대서
//   입추 처서 백로 추분 한로 상강 입동 소설 대설 동지 소한 대한
// peakTerm(절정)은 여기서 바로 바꾸면 됨 — 예: "대서" -> "입추"로 바꾸면 절정 시기가 늦춰짐
//
// gonggu: 실제 셀러와 계약이 성사된 유료 상단 슬롯. 계약 전까지는 빈 배열로 둔다.
// trending: 지금 화제/유행인 음식이면 true로 설정 (절기와 무관하게 수동으로 켜고 끔)
export const FOODS = {
  corn: {
    name: "옥수수",
    emoji: "🌽",
    startTerm: "하지",
    peakTerm: "대서",
    endTerm: "입추",
    why: "단맛이 가장 오른 시기예요. 알이 꽉 차고 수염이 갈색일수록 신선해요.",
    gonggu: [],
    trending: false,
  },
  peach: {
    name: "복숭아",
    emoji: "🍑",
    startTerm: "하지",
    peakTerm: "입추",
    endTerm: "백로",
    why: "당도가 오르기 시작하는 초입이에요. 향이 진하고 꼭지 주변이 붉을수록 좋아요.",
    gonggu: [],
    trending: false,
  },
  potato: {
    name: "감자",
    emoji: "🥔",
    startTerm: "소만",
    peakTerm: "하지",
    endTerm: "소서",
    why: "수확 막바지라 저장성이 가장 좋은 시기예요. 표면이 매끈한 것을 고르세요.",
    gonggu: [],
    trending: false,
  },
  abalone: {
    name: "전복",
    emoji: "🦪",
    startTerm: "하지",
    peakTerm: "대서",
    endTerm: "처서",
    why: "살이 오르기 시작하는 초입이에요. 껍데기 광택이 있고 입을 다무는 게 신선해요.",
    gonggu: [],
    trending: false,
  },
  blueberry: {
    name: "블루베리",
    emoji: "🫐",
    startTerm: "하지",
    peakTerm: "대서",
    endTerm: "입추",
    why: "당도와 색이 가장 진한 절정기예요. 표면에 하얀 분(果粉)이 있는 게 신선해요.",
    gonggu: [],
    trending: false,
  },
  plum: {
    name: "자두",
    emoji: "🍈",
    startTerm: "하지",
    peakTerm: "입추",
    endTerm: "백로",
    why: "새콤달콤한 맛이 막 올라오는 시기예요. 껍질에 탄력이 있는 걸 고르세요.",
    gonggu: [],
    trending: false,
  },
  croaker: {
    name: "민어",
    emoji: "🐟",
    startTerm: "하지",
    peakTerm: "대서",
    endTerm: "처서",
    why: "여름 보양식 절정기예요. 살이 단단하고 윤기가 도는 걸 고르세요.",
    gonggu: [],
    trending: false,
  },
};

// 상품 정렬: 공구(gonggu) 최상단 고정 → 자동추천(auto, 네이버 랭킹 순)
export function sortProducts(gonggu, auto) {
  return [...gonggu, ...auto.sort((a, b) => (a.rank || 999) - (b.rank || 999))];
}
