"use client";

import { useState } from "react";

export default function FestivalList({ festivals }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? festivals : festivals.slice(0, 5);
  const remaining = festivals.length - 5;

  return (
    <>
      {visible.map((spot, i) => (
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
      ))}

      {!expanded && remaining > 0 && (
        <button type="button" className="more-btn" onClick={() => setExpanded(true)}>
          더보기 ({remaining})
        </button>
      )}
    </>
  );
}
