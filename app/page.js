import Link from "next/link";
import { FOODS, SPOTS } from "@/lib/data";
import { getTodaySolarTermInfo, getStage } from "@/lib/solarTerms";

// 매 요청마다 "오늘" 기준으로 새로 계산 (빌드 시점에 날짜가 고정되지 않도록)
export const dynamic = "force-dynamic";

export default function HomePage() {
  const today = new Date();
  const { currentIdx, currentName, nextName, daysToNext } = getTodaySolarTermInfo(today);

  // 모든 제철 음식의 오늘 기준 단계 계산
  const foodsWithStage = Object.entries(FOODS).map(([slug, food]) => {
    const stage = getStage(food.startTerm, food.peakTerm, food.endTerm, currentIdx);
    return { slug, ...food, stage };
  });

  // 오늘의 제철인 것만 추림 (비제철은 제외)
  const inSeason = foodsWithStage.filter((f) => f.stage !== null);

  // 히어로: 절정 단계가 있으면 그중 첫번째, 없으면 제철 목록의 첫번째
  const hero = inSeason.find((f) => f.stage === "절정") || inSeason[0];
  const others = inSeason.filter((f) => f.slug !== hero?.slug);

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
          <div className="strip">
            {others.map((f) => (
              <Link href={`/product/${f.slug}`} className="mini-card" key={f.slug}>
                <span className={`stage-tab stage-${f.stage}`}>{f.stage}</span>
                <p className="mini-name">{f.name}</p>
              </Link>
            ))}
          </div>
        </>
      )}

      {hero && (
        <>
          <div className="section-title">{hero.name}와 함께 즐기기</div>
          {SPOTS.map((spot) => (
            <a
              key={spot.title}
              className="spot-row"
              href={`https://search.naver.com/search.naver?query=${encodeURIComponent(spot.query)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="spot-icon">{spot.icon}</div>
              <div>
                <p className="spot-title">{spot.title}</p>
                <p className="spot-sub">{spot.sub}</p>
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
