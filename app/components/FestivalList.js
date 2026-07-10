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

  // 렌더될 때마다 지금까지 가장 컸던 높이를 기록해두고, 그 아래로는 절대 줄어들지 않게 고정한다.
  // (탭을 바꿔서 리스트가 짧아지면 문서 높이가 줄어들고, 그 순간 브라우저가 스크롤 위치를
  //  강제로 당기면서 "튀는" 현상이 생기기 때문 — 높이가 안 줄면 이 현상 자체가 발생하지 않는다)
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
