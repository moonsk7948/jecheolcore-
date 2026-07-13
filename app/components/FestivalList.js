"use client";

import { useState, useMemo, useRef } from "react";
import { REGION_GROUPS, getRegionKey } from "@/lib/regions";

export default function FestivalList({ festivals }) {
  const [region, setRegion] = useState("all");
  const [expanded, setExpanded] = useState(false);
  const wrapperRef = useRef(null); // 높이 애니메이션 전용 (실제로 style을 건드리는 쪽)
  const innerRef = useRef(null); // 실제 콘텐츠. 항상 자연스러운 높이 그대로 두고 측정만 함

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
    const inner = innerRef.current;
    if (!wrapper || !inner) {
      updateFn();
      return;
    }

    const beforeHeight = wrapper.getBoundingClientRect().height;
    const startScrollY = window.scrollY;

    // wrapper만 지금 높이로 고정 (inner는 절대 건드리지 않음 — 늘 자연스러운 크기 유지)
    wrapper.style.transition = "none";
    wrapper.style.overflow = "hidden";
    wrapper.style.height = `${beforeHeight}px`;

    updateFn(); // 새 콘텐츠로 교체. inner는 이미 새 콘텐츠의 자연스러운 높이로 렌더링됨

    requestAnimationFrame(() => {
      const w = wrapperRef.current;
      const inn = innerRef.current;
      if (!w || !inn) return;

      // inner는 한 번도 안 건드렸으니 그냥 읽기만 하면 됨 (깜빡일 이유가 없음)
      const afterHeight = inn.getBoundingClientRect().height;
      const heightDiff = beforeHeight - afterHeight; // 양수면 줄어드는 것

      const maxScrollAfter = Math.max(
        0,
        document.documentElement.scrollHeight - heightDiff - window.innerHeight
      );
      const targetScrollY = Math.min(startScrollY, maxScrollAfter);
      const scrollDiff = targetScrollY - startScrollY;

      const duration = 420;
      const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      let startTime = null;

      function step(ts) {
        if (startTime === null) startTime = ts;
        const progress = Math.min((ts - startTime) / duration, 1);
        const eased = easeInOutCubic(progress);

        w.style.height = `${beforeHeight - heightDiff * eased}px`;
        if (scrollDiff !== 0) {
          window.scrollTo(0, startScrollY + scrollDiff * eased);
        }

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          w.style.transition = "";
          w.style.height = "";
          w.style.overflow = "";
        }
      }
      requestAnimationFrame(step);
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
      <div ref={innerRef}>
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
    </div>
  );
}
