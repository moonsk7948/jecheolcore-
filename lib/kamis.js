// KAMIS(농산물유통정보) 기간별 소매가격 조회
const KAMIS_BASE = "https://www.kamis.or.kr/service/price/xml.do";

function formatYmd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// "MM/DD" -> Date
function parseRegday(str, refYear) {
  const m = String(str || "").match(/^(\d{1,2})\/(\d{1,2})$/);
  if (!m) return null;
  return new Date(refYear, parseInt(m[1], 10) - 1, parseInt(m[2], 10));
}

// days일 전부터 오늘까지의 소매가격 추이를 가져온다
// KAMIS는 날짜마다 countyname="평균"인 전국 평균 행을 같이 내려주므로 그것만 사용한다
// (countyname="평년"은 작년 같은 기간 평균이라 가격이 아니라 비교값 — 제외)
export async function getPriceTrend({ itemCategoryCode, itemCode }, days = 30) {
  const certKey = process.env.KAMIS_CERT_KEY;
  const certId = process.env.KAMIS_CERT_ID;

  if (!certKey || !certId || !itemCategoryCode || !itemCode) {
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
    p_cert_key: certKey,
    p_cert_id: certId,
    p_returntype: "json",
  });

  const url = `${KAMIS_BASE}?${params.toString()}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 * 6 }, // 6시간 캐시
    });
    if (!res.ok) {
      console.error("[KAMIS] HTTP 응답 실패:", res.status, url);
      return [];
    }
    const data = await res.json();
    const rows = data?.data?.item;

    if (!rows) {
      console.error("[KAMIS] item 없음. 요청 URL:", url);
      console.error("[KAMIS] 응답 원문:", JSON.stringify(data));
      return [];
    }

    const list = Array.isArray(rows) ? rows : [rows];
    const refYear = end.getFullYear();

    const result = list
      .filter((row) => row.countyname === "평균") // 전국 평균 행만 사용
      .map((row) => {
        const dateObj = parseRegday(row.regday, refYear);
        const price = parseInt(String(row.price).replace(/,/g, ""), 10);
        return { dateObj, price, regday: row.regday };
      })
      .filter((r) => r.dateObj && r.price > 0)
      .sort((a, b) => a.dateObj - b.dateObj)
      .map((r) => ({
        date: `${r.dateObj.getMonth() + 1}.${r.dateObj.getDate()}`,
        price: r.price,
      }));

    if (result.length === 0) {
      console.error("[KAMIS] 파싱 결과 0건. 원본 rows:", JSON.stringify(list).slice(0, 500));
    }

    return result;
  } catch (e) {
    console.error("[KAMIS] 호출 에러:", e);
    return [];
  }
}
