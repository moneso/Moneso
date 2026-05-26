"use client";

export default function Ticker({ price, change }) {
  const items = [
    `XMR/USD  $${price ? price.toFixed(2) : "—"}`,
    change >= 0
      ? `24H  ▲ +${change ? change.toFixed(2) : "—"}%`
      : `24H  ▼ ${change ? change.toFixed(2) : "—"}%`,
    "RING SIZE  16",
    "AVG FEE  ~$0.02",
    "PRIVACY COIN  #1",
    "ALGORITHM  RANDOMX",
    "NO KYC  REQUIRED",
    "OPEN SOURCE  YES",
  ];

  const doubled = [...items, ...items];

  return (
    <div className="border-b border-border overflow-hidden"
      style={{ background: "rgba(255,102,0,0.03)", height: 34 }}>
      <div className="ticker-inner flex items-center h-full" style={{ width: "max-content" }}>
        {doubled.map((item, i) => (
          <span key={i} className="font-mono text-xs tracking-widest px-8 text-muted whitespace-nowrap"
            style={{ fontFamily: "var(--font-mono)" }}>
            {item}
            <span className="mx-6 opacity-20">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}
