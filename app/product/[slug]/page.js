import Link from "next/link";
import { notFound } from "next/navigation";
import { FOODS, sortProducts } from "@/lib/data";
import { getTodaySolarTermInfo, getStage } from "@/lib/solarTerms";
import { searchNaverShopping } from "@/lib/naverShopping";

export const dynamic = "force-dynamic";

export default async function ProductListPage({ params }) {
  const food = FOODS[params.slug];
  if (!food) return notFound();

  const { currentIdx } = getTodaySolarTermInfo(new Date());
  const stage = getStage(food.startTerm, food.peakTerm, food.endTerm, currentIdx) || "막바지";

  const autoProducts = await searchNaverShopping(food.name, 6);
  const sorted = sortProducts(food.gonggu || [], autoProducts);

  return (
    <>
      <div className="list-topbar">
        <Link href="/" className="back-btn">
          ←
        </Link>
        <span className="list-title">{food.name}</span>
        <span className={`stage-tab stage-${stage}`}>{stage}</span>
      </div>

      <div className="why-box">
        <p>{food.why} 아래는 네이버 쇼핑 실시간 검색결과예요.</p>
      </div>

      <div className="section-title">
        <span>제철코어가 고른 {food.name}</span>
        <span className="count">{sorted.length}개</span>
      </div>
      <p className="auto-note">
        공구 없을 땐 네이버 랭킹 상위 상품이 실시간으로 채워져요
      </p>

      {sorted.length === 0 && (
        <p style={{ margin: "0 20px", fontSize: 13, opacity: 0.6 }}>
          아직 검색된 상품이 없어요. (API 키 설정을 확인해주세요)
        </p>
      )}

      {sorted.map((p, i) => (
        <a
          key={i}
          className={`product-row ${p.slotType === "gonggu" ? "gonggu" : ""}`}
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className={`product-thumb ${p.slotType === "gonggu" ? "clay-bg" : "jade-bg"}`}>
            {food.emoji}
          </div>
          <div className="product-body">
            {p.slotType === "gonggu" ? (
              <span className="product-tag tag-gonggu">공구</span>
            ) : (
              <span className="product-tag tag-normal">
                {p.rankSource} 랭킹 {p.rank}위 · 실시간
              </span>
            )}
            <p className="product-name">{p.name}</p>
            <p className="product-source">{p.source}</p>
            <p className="product-price">{p.price.toLocaleString("ko-KR")}원</p>
          </div>
          <span className="product-ext">↗</span>
        </a>
      ))}

      <div style={{ height: 24 }} />
    </>
  );
}

