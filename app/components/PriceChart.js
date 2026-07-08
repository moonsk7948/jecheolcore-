export default function PriceChart({ data }) {
  if (!data || data.length < 2) return null;

  const width = 100; // viewBox 기준, 실제 렌더는 CSS로 반응형
  const height = 36;
  const padding = 2;

  const prices = data.map((d) => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((d.price - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const first = data[0];
  const last = data[data.length - 1];
  const diff = last.price - first.price;
  const diffPct = first.price ? Math.round((diff / first.price) * 100) : 0;
  const isUp = diff > 0;
  const isDown = diff < 0;

  return (
    <div className="price-chart">
      <div className="price-chart-head">
        <div>
          <p className="price-chart-now">{last.price.toLocaleString("ko-KR")}원</p>
          <p className="price-chart-sub">
            {first.date} ~ {last.date} 소매가 (kg 기준)
          </p>
        </div>
        <span
          className={
            "price-chart-diff " + (isUp ? "up" : isDown ? "down" : "")
          }
        >
          {isUp ? "▲" : isDown ? "▼" : "-"} {Math.abs(diffPct)}%
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="price-chart-svg">
        <polyline points={points.join(" ")} fill="none" stroke="var(--harvest)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}
