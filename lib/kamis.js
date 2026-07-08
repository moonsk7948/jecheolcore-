// KAMIS(농산물유통정보) 기간별 소매가격 조회
// 수산물(전복, 민어 등)은 KAMIS 대상이 아니므로 지원하지 않음
const KAMIS_BASE = "https://www.kamis.or.kr/service/price/xml.do";

function formatYmd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// days일 전부터 오늘까지의 소매가격 추이를 가져온다
export async function getPriceTrend({ itemCategoryCode, itemCode, kindCode, productRankCode = "04", countyCode = "1101" }, days = 30) {
  const certKey = process.env.KAMIS_CERT_KEY;
  const certId = process.env.KAMIS_CERT_ID; // KAMIS 가입 시 사용한 아이디

  if (!certKey || !itemCategoryCode || !itemCode || !kindCode) {
    return [];
  }

  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  const params = new URLSearchParams({
    action: "periodProductList",
    p_productclscode: "01", // 01=소매, 02=도매
    p_startday: formatYmd(start),
    p_endday: formatYmd(end),
    p_itemcategorycode: itemCategoryCode,
    p_itemcode: itemCode,
    p_kindcode: kindCode,
    p_productrankcode: productRankCode,
    p_countycode: countyCode,
    p_convert_kg_yn: "Y",
    p_cert_key: certKey,
    p_cert_id: certId || "",
    p_returntype: "json",
  });

  try {
    const url = `${KAMIS_BASE}?${params.toString()}`;
    const res = await fetch(url, {
      next: { revalidate: 3600 * 6 }, // 6시간 캐시 (하루 몇 번이면 충분)
    });
    if (!res.ok) {
      console.error("[KAMIS] HTTP 응답 실패:", res.status, url);
      return [];
    }
    const data = await res.json();
    const rows = data?.data?.item;

    if (!rows) {
      // 요청은 성공했지만 데이터가 없는 경우 — KAMIS가 보낸 원문 그대로 로그에 남김
      console.error("[KAMIS] item 없음. 요청 URL:", url);
      console.error("[KAMIS] 응답 원문:", JSON.stringify(data));
      return [];
    }

    const list = Array.isArray(rows) ? rows : [rows];

    const parsed = list
      .map((row) => ({
        date: row.regday, // "MM/DD" 형식으로 내려옴
        price: parseInt(String(row.price).replace(/,/g, ""), 10) || 0,
      }))
      .filter((r) => r.price > 0);

    if (parsed.length === 0) {
      console.error("[KAMIS] 파싱 결과 0건. 원본 rows:", JSON.stringify(list).slice(0, 500));
    }

    return parsed;
  } catch (e) {
    console.error("[KAMIS] 호출 에러:", e);
    return [];
  }
}
