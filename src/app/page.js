"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Ticker from "@/components/Ticker";
import PriceChart from "@/components/PriceChart";
import FeeCalculator from "@/components/FeeCalculator";
import Footer from "@/components/Footer";
import Link from "next/link";

function StatCard({ label, value, sub, highlight }) {
  return (
    <div className="border border-border px-5 py-4 fade-up"
      style={{ background: "#0a0a0a" }}>
      <div className="font-mono text-xs tracking-widest uppercase mb-2"
        style={{ fontFamily: "var(--font-mono)", color: "#3a3a3a" }}>
        {label}
      </div>
      <div className="font-mono text-xl font-medium"
        style={{ fontFamily: "var(--font-mono)", color: highlight ? "var(--xmr)" : "#F5ECD7" }}>
        {value}
      </div>
      {sub && (
        <div className="font-mono text-xs mt-1"
          style={{ fontFamily: "var(--font-mono)", color: "#3a3a3a" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [price, setPrice] = useState(null);
  const [change24h, setChange24h] = useState(null);
  const [marketCap, setMarketCap] = useState(null);
  const [volume, setVolume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = () => {
      fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=monero&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true"
      )
        .then((r) => r.json())
        .then((data) => {
          if (data.monero) {
            setPrice(data.monero.usd);
            setChange24h(data.monero.usd_24h_change);
            setMarketCap(data.monero.usd_market_cap);
            setVolume(data.monero.usd_24h_vol);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    fetchPrice();
    const id = setInterval(fetchPrice, 30000); // refresh every 30s
    return () => clearInterval(id);
  }, []);

  const formatBig = (n) => {
    if (!n) return "—";
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    return `$${n.toFixed(0)}`;
  };

  const isPositive = change24h >= 0;

  return (
    <div className="grid-bg min-h-screen">
      <Navbar />

      {/* Top spacer for fixed nav */}
      <div style={{ height: 48 }} />

      <Ticker price={price} change={change24h} />

      <main className="max-w-6xl mx-auto px-6 pt-16 pb-8">

        {/* Hero price */}
        <div className="mb-12 fade-up">
          <div className="font-mono text-xs tracking-widest uppercase mb-3"
            style={{ fontFamily: "var(--font-mono)", color: "#3a3a3a" }}>
            Monero — XMR / USD
          </div>
          <div className="flex items-baseline gap-5 flex-wrap">
            <span className="font-display text-7xl md:text-8xl font-800 text-bright"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "#F5ECD7",
              }}>
              {loading ? "—" : price ? `$${price.toFixed(2)}` : "—"}
            </span>
            {change24h !== null && (
              <span className="font-mono text-xl font-medium"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: isPositive ? "#22c55e" : "#ef4444",
                }}>
                {isPositive ? "▲" : "▼"} {Math.abs(change24h).toFixed(2)}%
              </span>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 fade-up fade-up-delay-1">
          <StatCard
            label="Market Cap"
            value={formatBig(marketCap)}
          />
          <StatCard
            label="24H Volume"
            value={formatBig(volume)}
          />
          <StatCard
            label="Avg Network Fee"
            value="~$0.02"
            sub="~0.00012 XMR"
          />
          <StatCard
            label="Ring Size"
            value="16"
            sub="Default — v0.18"
          />
        </div>

        {/* Chart + Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-8 fade-up fade-up-delay-2">
          <div className="lg:col-span-2">
            <PriceChart />
          </div>
          <div>
            <FeeCalculator price={price} />
          </div>
        </div>

        {/* CTA strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 fade-up fade-up-delay-3">
          {[
            {
              href: "/swap",
              tag: "Beginner",
              title: "How to get XMR",
              desc: "No-KYC step-by-step guide to buying Monero privately.",
              cta: "Read guide →",
            },
            {
              href: "/guides",
              tag: "Learn",
              title: "Monero Guides",
              desc: "Wallets, nodes, mining, privacy — everything explained clearly.",
              cta: "Browse guides →",
            },
            {
              href: "/news",
              tag: "Latest",
              title: "Community News",
              desc: "What's happening in the Monero ecosystem right now.",
              cta: "See news →",
            },
          ].map((card) => (
            <Link key={card.href} href={card.href}
              className="border border-border p-6 block group transition-all duration-200 hover:border-opacity-60"
              style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(255,102,0,0.3)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "#1a1a1a"}
            >
              <div className="font-mono text-xs tracking-widest uppercase mb-3"
                style={{ fontFamily: "var(--font-mono)", color: "var(--xmr)", opacity: 0.7 }}>
                {card.tag}
              </div>
              <div className="font-display text-lg font-600 text-bright mb-2"
                style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "#F5ECD7" }}>
                {card.title}
              </div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "#444" }}>
                {card.desc}
              </p>
              <span className="font-mono text-xs tracking-widest"
                style={{ fontFamily: "var(--font-mono)", color: "var(--xmr)", opacity: 0.6 }}>
                {card.cta}
              </span>
            </Link>
          ))}
        </div>

      </main>

      <Footer />
    </div>
  );
}
