"use client";

import { useRef } from "react";
import Link from "next/link";

export default function SeasonStrip({ items }) {
  const scrollRef = useRef(null);

  const scrollByAmount = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 240, behavior: "smooth" });
    }
  };

  return (
    <div className="strip-wrap">
      <button
        type="button"
        className="strip-arrow"
        onClick={() => scrollByAmount(-1)}
        aria-label="이전 제철 음식 보기"
      >
        ‹
      </button>

      <div className="strip" ref={scrollRef}>
        {items.map((f) => (
          <Link href={`/product/${f.slug}`} className="mini-card" key={f.slug}>
            <div className="mini-card-tags">
              {f.stage && <span className={`stage-tab stage-${f.stage}`}>{f.stage}</span>}
              {f.trending && <span className="trend-tag">🔥</span>}
            </div>
            <p className="mini-name">{f.name}</p>
          </Link>
        ))}
      </div>

      <button
        type="button"
        className="strip-arrow"
        onClick={() => scrollByAmount(1)}
        aria-label="다음 제철 음식 보기"
      >
        ›
      </button>
    </div>
  );
}
