import Link from "next/link";
import SeasonStrip from "./components/SeasonStrip";
import { FOODS } from "@/lib/data";
import { getTodaySolarTermInfo, getStage } from "@/lib/solarTerms";
import { searchFestivalsByKeyword } from "@/lib/tourApi";

// 날짜/절기는 매 요청마다 새로 계산 (fetch 결과 자체는 아래에서 1시간 캐시)
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const today = new Date();
  const { currentIdx, currentName, nextName, daysToNext } = getTodaySolarTermInfo(today);

  const foodsWithStage = Object.entries(FOODS).map(([slug, food]) => {
    const stage = getStage(food.startTerm, food.peakTerm, food.endTerm, currentIdx);
    return { slug, ...food, stage };
  });

  const inSeason = foodsWithStage.filter((f) => f.stage !== null);
  const hero = inSeason.find((f) => f.stage === "절정") || inSeason[0];

  // 절정 → 초입 → 막바지 순으로 정렬
  const stageOrder = { 절정: 0, 초입: 1, 막바지: 2 };
  const others = inSeason
    .filter((f) => f.slug !== hero?.slug)
    .sort((a, b) => stageOrder[a.stage] - stageOrder[b.stage]);

  // 지금 제철인 음식들 기준으로 TourAPI에서 실시간 축제 검색
  // (키워드는 음식 이름만 사용 — "음식명 축제"로 붙이면 제목 매칭률이 크게 떨어짐)
  const spotGroups = await Promise.all(
    inSeason.map(async (f) => {
      const festivals = await searchFestivalsByKeyword(f.name, 2);
      return festivals.map((fest) => ({
        ...fest,
        foodSlug: f.slug,
        foodName: f.name,
        foodEmoji: f.emoji,
      }));
    })
  );
  const seasonSpots = spotGroups.flat();

  const dateLabel = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).format(today);

  return (
    <>
      <div className="topbar">
        <span className="brand">제철코어</span>
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

      {seasonSpots.length > 0 && (
        <>
          <div className="section-title">지금 제철 축제·명소</div>
          {seasonSpots.map((spot, i) => (
            <a
              key={`${spot.contentId}-${i}`}
              className="spot-row"
              href={`https://search.naver.com/search.naver?query=${encodeURIComponent(spot.title)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="spot-icon">🎪</div>
              <div>
                <span className="spot-food-tag">
                  {spot.foodEmoji} {spot.foodName}
                </span>
                <p className="spot-title">{spot.title}</p>
                <p className="spot-sub">{spot.period || spot.addr || "TourAPI 실시간 검색결과"}</p>
              </div>
              <span className="spot-arrow">↗</span>
            </a>
          ))}
        </>
      )}

      <div style={{ height: 24 }} />
    </>
  );
}

