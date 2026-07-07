// 제철 음식 데이터
// startTerm/peakTerm/endTerm: 24절기 순번(0~23), lib/solarTerms.js의 SOLAR_TERMS 인덱스 참고
//   0입춘 1우수 2경칩 3춘분 4청명 5곡우 6입하 7소만 8망종 9하지 10소서 11대서
//   12입추 13처서 14백로 15추분 16한로 17상강 18입동 19소설 20대설 21동지 22소한 23대한
export const FOODS = {
  corn: {
    name: "옥수수",
    emoji: "🌽",
    startTerm: 9, // 하지
    peakTerm: 11, // 대서
    endTerm: 12, // 입추
    why: "단맛이 가장 오른 시기예요. 알이 꽉 차고 수염이 갈색일수록 신선해요.",
    products: [
      {
        name: "강원 홍천 찰옥수수 10개입",
        source: "스마트스토어 · 산지직송",
        price: 14900,
        url: "#",
        slotType: "gonggu",
      },
      {
        name: "횡성 찰옥수수 15개입",
        source: "네이버 스마트스토어",
        price: 16500,
        url: "#",
        slotType: "auto",
        rankSource: "네이버",
        rank: 1,
      },
      {
        name: "제천 초당옥수수 3kg",
        source: "쿠팡",
        price: 21000,
        url: "#",
        slotType: "auto",
        rankSource: "쿠팡",
        rank: 1,
      },
      {
        name: "단양 백옥수수 8개입",
        source: "네이버 스마트스토어",
        price: 12800,
        url: "#",
        slotType: "auto",
        rankSource: "네이버",
        rank: 2,
      },
    ],
  },
  peach: {
    name: "복숭아",
    emoji: "🍑",
    startTerm: 9,
    peakTerm: 12,
    endTerm: 14,
    why: "당도가 오르기 시작하는 초입이에요. 향이 진하고 꼭지 주변이 붉을수록 좋아요.",
    products: [
      {
        name: "충주 황도 5kg",
        source: "쿠팡",
        price: 28000,
        url: "#",
        slotType: "auto",
        rankSource: "쿠팡",
        rank: 1,
      },
      {
        name: "청도 천도복숭아 3kg",
        source: "네이버 스마트스토어",
        price: 19900,
        url: "#",
        slotType: "auto",
        rankSource: "네이버",
        rank: 1,
      },
    ],
  },
  potato: {
    name: "감자",
    emoji: "🥔",
    startTerm: 7,
    peakTerm: 9,
    endTerm: 10,
    why: "수확 막바지라 저장성이 가장 좋은 시기예요. 표면이 매끈한 것을 고르세요.",
    products: [
      {
        name: "강원 고랭지 감자 5kg",
        source: "네이버 스마트스토어",
        price: 13900,
        url: "#",
        slotType: "auto",
        rankSource: "네이버",
        rank: 1,
      },
    ],
  },
  abalone: {
    name: "전복",
    emoji: "🦪",
    startTerm: 9,
    peakTerm: 11,
    endTerm: 13,
    why: "살이 오르기 시작하는 초입이에요. 껍데기 광택이 있고 입을 다무는 게 신선해요.",
    products: [
      {
        name: "완도 전복 특대 20미",
        source: "쿠팡",
        price: 45000,
        url: "#",
        slotType: "auto",
        rankSource: "쿠팡",
        rank: 1,
      },
    ],
  },
  blueberry: {
    name: "블루베리",
    emoji: "🫐",
    startTerm: 9,
    peakTerm: 11,
    endTerm: 12,
    why: "당도와 색이 가장 진한 절정기예요. 표면에 하얀 분(果粉)이 있는 게 신선해요.",
    products: [
      {
        name: "고흥 블루베리 1kg",
        source: "네이버 스마트스토어",
        price: 15000,
        url: "#",
        slotType: "auto",
        rankSource: "네이버",
        rank: 1,
      },
    ],
  },
  plum: {
    name: "자두",
    emoji: "🍈",
    startTerm: 9,
    peakTerm: 12,
    endTerm: 14,
    why: "새콤달콤한 맛이 막 올라오는 시기예요. 껍질에 탄력이 있는 걸 고르세요.",
    products: [
      {
        name: "김천 자두 4kg",
        source: "쿠팡",
        price: 22000,
        url: "#",
        slotType: "auto",
        rankSource: "쿠팡",
        rank: 1,
      },
    ],
  },
  croaker: {
    name: "민어",
    emoji: "🐟",
    startTerm: 9,
    peakTerm: 11,
    endTerm: 13,
    why: "여름 보양식 절정기예요. 살이 단단하고 윤기가 도는 걸 고르세요.",
    products: [
      {
        name: "신안 민어 손질 1kg",
        source: "네이버 스마트스토어",
        price: 38000,
        url: "#",
        slotType: "auto",
        rankSource: "네이버",
        rank: 1,
      },
    ],
  },
};

// 명소·축제 (클릭 시 자체 페이지 없이 포털 검색결과로 바로 이동)
export const SPOTS = [
  {
    icon: "🎪",
    title: "강원 찰옥수수 축제",
    sub: "7.10 ~ 7.13 · 강원 홍천",
    query: "강원 찰옥수수 축제",
  },
  {
    icon: "📍",
    title: "횡성 옥수수 직판장 거리",
    sub: "강원 횡성",
    query: "횡성 옥수수 직판장",
  },
];

// 상품 정렬 로직: 공구(gonggu) 최상단 고정 → 자동추천(auto, 랭킹 순) → 수동추천(manual)
export function sortProducts(products) {
  const gonggu = products.filter((p) => p.slotType === "gonggu");
  const auto = products
    .filter((p) => p.slotType === "auto")
    .sort((a, b) => (a.rank || 999) - (b.rank || 999));
  const manual = products.filter((p) => p.slotType === "manual");
  return [...gonggu, ...auto, ...manual];
}
