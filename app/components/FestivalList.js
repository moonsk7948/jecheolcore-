"use client";

import { useState, useMemo, useRef, useLayoutEffect } from "react";
import { REGION_GROUPS, getRegionKey } from "@/lib/regions";

export default function FestivalList({ festivals }) {
  const [region, setRegion] = useState("all");
  const [expanded, setExpanded] = useState(false);
  const [minHeight, setMinHeight] = useState(0);

  const wrapperRef = useRef(null);
  const maxHeightRef = useRef(0);

  // 실제 데이터에 존재하는 지역만 탭으로 노출 (0건인 지역 탭은 숨김)
  const availableRegionKeys = useMemo(() => {
    const keys = new Set(festivals.map((f) => getRegionKey(f.addr)));
    return keys;
  }, [festivals]);

  const tabs = REGION_GROUPS.filter((g) => g.key === "all" || availableRegionKeys.has(g.key));

  const filtered = useMemo(() => {
    if (region === "all") return festivals;
    return festivals.filter((f) => getRegionKey(f.addr) === region);
  }, [festivals, region]);

  const visible = expanded ? filtered : filtered.slice(0, 5);
  const remaining = filtered.length - 5;

  // 지금까지 렌더링된 것 중 가장 컸던 높이를 계속 기록해두고, 그 아래로는 절대 줄지 않게 고정한다.
  // 로직이 단순해서(측정 -> 기록 -> 큰 값이면 반영) 실패 케이스가 없다.
  useLayoutEffect(() => {
    if (wrapperRef.current) {
      const h = wrapperRef.current.scrollHeight;
      if (h > maxHeightRef.current) {
        maxHeightRef.current = h;
        setMinHeight(h);
      }
    }
  });

  function selectRegion(key) {
    setRegion(key);
    setExpanded(false); // 지역 바꾸면 더보기 상태 초기화
  }

  return (
    <div ref={wrapperRef} style={{ minHeight: minHeight || undefined }}>
      <div className="region-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`region-tab ${region === t.key ? "active" : ""}`}
            onClick={() => selectRegion(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="channel-empty">이 지역엔 지금 표시할 축제가 없어요.</p>
      ) : (
        visible.map((spot, i) => (
          <a
            key={`${spot.contentId}-${i}`}
            className="spot-row"
            href={`https://search.naver.com/search.naver?query=${encodeURIComponent(spot.title)}`}
            target="_blank"
            rel="noopener"
            referrerPolicy="origin"
          >
            <div className="spot-icon">🎪</div>
            <div>
              <span className={`spot-status-tag ${spot.status === "진행중" ? "ongoing" : "upcoming"}`}>
                {spot.status}
              </span>
              <p className="spot-title">{spot.title}</p>
              <p className="spot-sub">{spot.period || spot.addr}</p>
            </div>
            <span className="spot-arrow">↗</span>
          </a>
        ))
      )}

      {!expanded && remaining > 0 && (
        <button type="button" className="more-btn" onClick={() => setExpanded(true)}>
          더보기 ({remaining})
        </button>
      )}
    </div>
  );
}
