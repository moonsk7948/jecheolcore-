// TourAPI areacode -> 광역 지역 그룹 매핑
// 참고: 1서울 2인천 3대전 4대구 5광주 6부산 7울산 8세종
//       31경기 32강원 33충북 34충남 35경북 36경남 37전북 38전남 39제주
export const REGION_GROUPS = [
  { key: "all", label: "전체", codes: null },
  { key: "capital", label: "수도권", codes: ["1", "2", "31"] },
  { key: "gangwon", label: "강원", codes: ["32"] },
  { key: "chungcheong", label: "충청", codes: ["3", "8", "33", "34"] },
  { key: "jeolla", label: "전라", codes: ["5", "37", "38"] },
  { key: "gyeongsang", label: "경상", codes: ["4", "6", "7", "35", "36"] },
  { key: "jeju", label: "제주", codes: ["39"] },
];

export function getRegionKey(areacode) {
  const group = REGION_GROUPS.find((g) => g.codes && g.codes.includes(String(areacode)));
  return group ? group.key : "etc";
}
