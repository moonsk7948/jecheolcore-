"use client";

import { useState } from "react";

function ProductRow({ product, emoji }) {
  return (
    <a
      className={`product-row ${product.slotType === "gonggu" ? "gonggu" : ""}`}
      href={product.url}
      target="_blank"
      rel="noopener"
      referrerPolicy="origin"
    >
      <div className={`product-thumb ${product.slotType === "gonggu" ? "clay-bg" : "jade-bg"}`}>
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt={product.name} className="product-thumb-img" />
        ) : (
          emoji
        )}
      </div>
      <div className="product-body">
        {product.slotType === "gonggu" ? (
          <span className="product-tag tag-gonggu">공구</span>
        ) : (
          <span className="product-tag tag-normal">
            {product.rankSource} 랭킹 {product.rank}위 · 실시간
          </span>
        )}
        <p className="product-name">{product.name}</p>
        <p className="product-source">{product.source}</p>
        <p className="product-price">{product.price.toLocaleString("ko-KR")}원</p>
      </div>
      <span className="product-ext">↗</span>
    </a>
  );
}

export default function ProductTabs({ gonggu, naverProducts, coupangProducts, emoji }) {
  const tabs = [
    { key: "naver", label: "네이버", products: naverProducts },
    { key: "coupang", label: "쿠팡", products: coupangProducts },
  ];

  const [active, setActive] = useState("naver");
  const current = tabs.find((t) => t.key === active);

  return (
    <>
      {gonggu.length > 0 && (
        <div className="gonggu-section">
          {gonggu.map((p, i) => (
            <ProductRow key={`gonggu-${i}`} product={p} emoji={emoji} />
          ))}
        </div>
      )}

      <div className="channel-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`channel-tab ${active === t.key ? "active" : ""}`}
            onClick={() => setActive(t.key)}
          >
            {t.label}
            {t.products.length > 0 && <span className="channel-tab-count">{t.products.length}</span>}
          </button>
        ))}
      </div>

      {current.products.length === 0 ? (
        <p className="channel-empty">
          {active === "coupang"
            ? "쿠팡 연동 준비 중이에요. 곧 만나요!"
            : "아직 검색된 상품이 없어요. (API 키 설정을 확인해주세요)"}
        </p>
      ) : (
        current.products.map((p, i) => <ProductRow key={i} product={p} emoji={emoji} />)
      )}
    </>
  );
}
