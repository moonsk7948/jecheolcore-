// TourAPI의 areacode 필드는 비어있는 경우가 많아 신뢰할 수 없음.
// 대신 addr1(주소) 텍스트 맨 앞의 시/도명으로 지역을 판별한다.
export const REGION_GROUPS = [
  { key: "all", label: "전체", keywords: null },
  { key: "capital", label: "수도권", keywords: ["서울", "인천", "경기"] },
  { key: "gangwon", label: "강원", keywords: ["강원"] },
  { key: "chungcheong", label: "충청", keywords: ["대전", "세종", "충북", "충청북", "충남", "충청남"] },
  { key: "jeolla", label: "전라", keywords: ["광주", "전북", "전라북", "전남", "전라남"] },
  { key: "gyeongsang", label: "경상", keywords: ["대구", "부산", "울산", "경북", "경상북", "경남", "경상남"] },
  { key: "jeju", label: "제주", keywords: ["제주"] },
];

export function getRegionKey(addr) {
  if (!addr) return "etc";
  const group = REGION_GROUPS.find((g) => g.keywords && g.keywords.some((kw) => addr.includes(kw)));
  return group ? group.key : "etc";
}
