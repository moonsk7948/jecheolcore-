"use client";

import { useState, useMemo, useRef } from "react";
import { REGION_GROUPS, getRegionKey } from "@/lib/regions";

// easeInOutCubic 이징을 쓴 커스텀 스크롤 애니메이션 (브라우저 기본 smooth보다 부드럽게 조절 가능)
function animateScrollTo(targetY, duration = 550) {
  const startY = window.scrollY;
  const diff = targetY - startY;
  if (Math.abs(diff) < 1) return Promise.resolve();

  let startTime = null;

  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  return new Promise((resolve) => {
    function step(timestamp) {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startY + diff * easeInOutCubic(progress));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    }
    requestAnimationFrame(step);
  });
}

export default function FestivalList({ festivals }) {
  const [region, setRegion] = useState("all");
  const [expanded, setExpanded] = useState(false);
  const wrapperRef = useRef(null);

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

  function selectRegion(key) {
    const wrapper = wrapperRef.current;

    // 리스트가 짧아지는 순간 브라우저가 스크롤을 강제로 당기는 걸 막기 위해,
    // state 변경(리렌더) 전에 지금 높이로 먼저 얼려둔다 (React 렌더와 무관하게 DOM에 직접 반영)
    if (wrapper) {
      wrapper.style.minHeight = `${wrapper.offsetHeight}px`;
    }

    setRegion(key);
    setExpanded(false); // 지역 바꾸면 더보기 상태 초기화

    requestAnimationFrame(async () => {
      if (!wrapper) return;
      const targetY = wrapper.getBoundingClientRect().top + window.scrollY;
      await animateScrollTo(targetY);
      wrapper.style.minHeight = ""; // 이동 끝났으니 고정 해제 (자연스러운 높이로 복귀)
    });
  }

  return (
    <div ref={wrapperRef}>
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
