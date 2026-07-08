import Link from "next/link";
import { notFound } from "next/navigation";
import { FOODS } from "@/lib/data";
import { getTodaySolarTermInfo, getStage, termIndex } from "@/lib/solarTerms";
import { searchNaverShopping } from "@/lib/naverShopping";
import { searchCoupang } from "@/lib/coupang";
import ProductTabs from "../../components/ProductTabs";

export const dynamic = "force-dynamic";

export default async function ProductListPage({ params }) {
  const food = FOODS[params.slug];
  if (!food) return notFound();

  const { currentIdx } = getTodaySolarTermInfo(new Date());
  const stage =
    getStage(termIndex(food.startTerm), termIndex(food.peakTerm), termIndex(food.endTerm), currentIdx) ||
    "막바지";

  const [naverProducts, coupangProducts] = await Promise.all([
    searchNaverShopping(food.name, 10),
    searchCoupang(food.name, 10),
  ]);

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
        <p>{food.why} 아래는 실시간 검색결과예요.</p>
      </div>

      <div className="section-title">
        <span>제철코어가 고른 {food.name}</span>
      </div>

      <ProductTabs
        gonggu={food.gonggu || []}
        naverProducts={naverProducts}
        coupangProducts={coupangProducts}
        emoji={food.emoji}
      />

      <div style={{ height: 24 }} />
    </>
  );
}
