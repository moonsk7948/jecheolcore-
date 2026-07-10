"use client";

import { useState, useMemo, useRef } from "react";
import { REGION_GROUPS, getRegionKey } from "@/lib/regions";

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

  function applyChange(e, updateFn) {
    e.currentTarget.blur(); // 클릭된 버튼에 포커스가 남아 브라우저가 자체적으로 스크롤시키는 것 방지

    const wrapper = wrapperRef.current;
    if (wrapper) {
      // 1) 지금 높이를 min-height(바닥값)로 고정 — 문서 높이가 갑자기 줄지 않게 막는다
      const currentHeight = wrapper.getBoundingClientRect().height;
      wrapper.style.transition = "none";
      wrapper.style.minHeight = `${currentHeight}px`;
    }

    updateFn(); // state 변경 -> 새 콘텐츠로 교체 (하지만 min-height가 막고 있어 화면은 안 줄어듦)

    requestAnimationFrame(() => {
      const w = wrapperRef.current;
      if (!w) return;
      // 2) min-height를 0으로 천천히 내린다. 실제 콘텐츠보다 더 내려가진 않으므로
      //    "얼마로 줄어들지" 미리 잴 필요 없이 자연스럽게 새 콘텐츠 높이에서 멈춘다
      w.style.transition = "min-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)";
      w.style.minHeight = "0px";
    });
  }

  function selectRegion(key, e) {
    applyChange(e, () => {
      setRegion(key);
      setExpanded(false); // 지역 바꾸면 더보기 상태 초기화
    });
  }

  function showMore(e) {
    applyChange(e, () => setExpanded(true));
  }

  return (
    <div ref={wrapperRef}>
      <div className="region-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`region-tab ${region === t.key ? "active" : ""}`}
            onClick={(e) => selectRegion(t.key, e)}
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
        <button type="button" className="more-btn" onClick={showMore}>
          더보기 ({remaining})
        </button>
      )}
    </div>
  );
}
