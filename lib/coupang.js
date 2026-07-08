// 쿠팡 파트너스 API 연동
// 승인 전까지는 환경변수가 없어서 항상 빈 배열을 반환한다.
// 승인되면 COUPANG_ACCESS_KEY / COUPANG_SECRET_KEY 환경변수만 추가하고
// 이 함수 안의 실제 요청 로직만 채우면 됨 (호출부/화면 쪽은 이미 다 연결되어 있음)
export async function searchCoupang(keyword, limit = 10) {
  const accessKey = process.env.COUPANG_ACCESS_KEY;
  const secretKey = process.env.COUPANG_SECRET_KEY;

  if (!accessKey || !secretKey) {
    return [];
  }

  // TODO: 쿠팡 파트너스 승인 후 실제 상품 검색 API 요청 구현
  // 참고: 쿠팡 파트너스는 HMAC 서명 방식 인증이 필요함
  return [];
}
