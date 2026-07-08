// KAMIS(농산물유통정보) 기간별 소매가격 조회
const KAMIS_BASE = "https://www.kamis.or.kr/service/price/xml.do";

function formatYmd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// KAMIS가 내려주는 날짜 문자열("YYYY-MM-DD" 또는 "MM/DD")을 Date로 변환
function parseKamisDate(str, refYear) {
  if (!str) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return new Date(str);
  const m = str.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (m) return new Date(refYear, parseInt(m[1], 10) - 1, parseInt(m[2], 10));
  return null;
}

// days일 전부터 오늘까지의 소매가격 추이를 가져온다
// periodProductList는 여러 지역/품종이 섞여 나올 수 있어 날짜별로 평균을 내서 하나의 추세선으로 만든다
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

    // 날짜별로 그룹핑해서 평균 가격 계산 (여러 지역/품종 혼재 대응)
    const byDate = new Map();
    for (const row of list) {
      const dateObj = parseKamisDate(row.date, refYear);
      const price = parseInt(String(row.price).replace(/,/g, ""), 10);
      if (!dateObj || !price || price <= 0) continue;

      const key = formatYmd(dateObj);
      if (!byDate.has(key)) byDate.set(key, { sum: 0, count: 0, dateObj });
      const entry = byDate.get(key);
      entry.sum += price;
      entry.count += 1;
    }

    const result = Array.from(byDate.entries())
      .map(([key, { sum, count, dateObj }]) => ({
        sortKey: key,
        date: `${dateObj.getMonth() + 1}.${dateObj.getDate()}`,
        price: Math.round(sum / count),
      }))
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey));

    if (result.length === 0) {
      console.error("[KAMIS] 파싱 결과 0건. 원본 rows:", JSON.stringify(list).slice(0, 500));
    }

    return result;
  } catch (e) {
    console.error("[KAMIS] 호출 에러:", e);
    return [];
  }
}
