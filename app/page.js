import Link from "next/link";
import SeasonStrip from "./components/SeasonStrip";
import FestivalList from "./components/FestivalList";
import { FOODS } from "@/lib/data";
import { getTodaySolarTermInfo, getStage, termIndex } from "@/lib/solarTerms";
import { searchAllFestivals } from "@/lib/tourApi";

// 날짜/절기는 매 요청마다 새로 계산 (fetch 결과 자체는 아래에서 1시간 캐시)
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const today = new Date();
  const { currentIdx, currentName, nextName, daysToNext } = getTodaySolarTermInfo(today);

  const foodsWithStage = Object.entries(FOODS).map(([slug, food]) => {
    // 유행 전용 항목(startTerm 등이 없는 경우)은 절기 계산을 아예 타지 않음
    const hasSeasonData = food.startTerm && food.peakTerm && food.endTerm;
    const stage = hasSeasonData
      ? getStage(termIndex(food.startTerm), termIndex(food.peakTerm), termIndex(food.endTerm), currentIdx)
      : null;
    return { slug, ...food, stage };
  });

  // 절기상 제철인 것 + 유행 플래그가 켜진 것(절기 무관) 모두 포함
  const inSeason = foodsWithStage.filter((f) => f.stage !== null || f.trending);

  // 히어로는 원칙적으로 절정 단계 음식. 단, heroOverride가 켜진 유행 항목이 있으면 그게 최우선
  const hero =
    inSeason.find((f) => f.heroOverride) ||
    inSeason.find((f) => f.stage === "절정") ||
    inSeason[0];

  // 유행인 것 먼저, 그다음 절정 → 초입 → 막바지 순으로 정렬 (절기 없는 유행 항목끼리는 순서 유지)
  const stageOrder = { 절정: 0, 초입: 1, 막바지: 2 };
  const others = inSeason
    .filter((f) => f.slug !== hero?.slug)
    .sort((a, b) => {
      if (a.trending !== b.trending) return a.trending ? -1 : 1;
      if (a.stage && b.stage) return stageOrder[a.stage] - stageOrder[b.stage];
      return 0;
    });

  // 전국 축제 전체 (연중 상시 축제는 제외), 진행중 우선 + 가까운 날짜순은 함수 내부에서 처리됨
  const nearbyFestivals = await searchAllFestivals(14, 400);

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
                {hero.stage && <span className={`stage-tab stage-${hero.stage}`}>{hero.stage}</span>}
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

      <div className="banner-slot">
        <span className="banner-slot-tag">AD</span>
        <span className="banner-slot-text">광고 배너 자리 (준비중)</span>
      </div>

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

