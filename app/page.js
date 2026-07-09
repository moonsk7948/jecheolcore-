import Link from "next/link";
import SeasonStrip from "./components/SeasonStrip";
import FestivalList from "./components/FestivalList";
import { FOODS } from "@/lib/data";
import { getTodaySolarTermInfo, getStage, termIndex } from "@/lib/solarTerms";
import { searchFoodFestivals } from "@/lib/tourApi";

// 날짜/절기는 매 요청마다 새로 계산 (fetch 결과 자체는 아래에서 1시간 캐시)
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const today = new Date();
  const { currentIdx, currentName, nextName, daysToNext } = getTodaySolarTermInfo(today);

  const foodsWithStage = Object.entries(FOODS).map(([slug, food]) => {
    const stage = getStage(
      termIndex(food.startTerm),
      termIndex(food.peakTerm),
      termIndex(food.endTerm),
      currentIdx
    );
    return { slug, ...food, stage };
  });

  const inSeason = foodsWithStage.filter((f) => f.stage !== null);
  const hero = inSeason.find((f) => f.stage === "절정") || inSeason[0];

  // 절정 → 초입 → 막바지 순으로 정렬
  const stageOrder = { 절정: 0, 초입: 1, 막바지: 2 };
  const others = inSeason
    .filter((f) => f.slug !== hero?.slug)
    .sort((a, b) => stageOrder[a.stage] - stageOrder[b.stage]);

  // 제철나우에 등록된 음식 여부와 무관하게, 전국 축제 중 먹거리 관련 축제 전체를 가져옴
  const nearbyFestivals = await searchFoodFestivals(14, 100);

  const dateLabel = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).format(today);

  return (
    <>
      <div className="topbar">
        <span className="brand">제철나우</span>
        <span className="date">{dateLabel}</span>
      </div>

      <div className="dial-wrap">
        <div>
          <p className="dial-title">{currentName} 지나는 중</p>
          <p className="dial-sub">
            다음 절기 {nextName}까지 {daysToNext}일
          </p>
        </div>
      </div>

      {hero && (
        <>
          <div className="section-title">오늘의 제철 TOP</div>
          <Link href={`/product/${hero.slug}`} className="hero-card">
            <div className="hero-top">
              <div>
                <span className={`stage-tab stage-${hero.stage}`}>{hero.stage}</span>
                {hero.trending && <span className="trend-tag">🔥 유행</span>}
                <p className="hero-name">{hero.name}</p>
                <p className="hero-desc">{hero.why}</p>
              </div>
              <div className="hero-badge-icon">{hero.emoji}</div>
            </div>
          </Link>
        </>
      )}

      {others.length > 0 && (
        <>
          <div className="section-title">
            <span>이번 주 제철</span>
            <span className="count">전체 {others.length}종</span>
          </div>
          <SeasonStrip items={others} />
        </>
      )}

      {nearbyFestivals.length > 0 && (
        <>
          <div className="section-title">지금 · 곧 열리는 축제</div>
          <FestivalList festivals={nearbyFestivals} />
        </>
      )}

      <div style={{ height: 24 }} />
    </>
  );
}

