"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Ticker from "@/components/Ticker";
import Footer from "@/components/Footer";
import Link from "next/link";
import { getPaymentMethod, getCurrency } from "@/lib/constants";
import { createClient } from "@/lib/supabase";

export default function Home() {
  const [price, setPrice] = useState(null);
  const [change24h, setChange24h] = useState(null);
  const [marketCap, setMarketCap] = useState(null);
  const [volume, setVolume] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchPrice();
    fetchListings();
  }, []);

  async function fetchPrice() {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=monero&vs_currencies=usd,eur&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true"
      );
      const data = await res.json();
      if (data.monero) {
        setPrice(data.monero.usd);
        setChange24h(data.monero.usd_24h_change);
        setMarketCap(data.monero.usd_market_cap);
        setVolume(data.monero.usd_24h_vol);
      }
    } catch {}
  }

  async function fetchListings() {
    const { data } = await supabase
      .from("listings")
      .select("*, profiles(username, trade_count, positive_feedback, negative_feedback, is_online)")
      .eq("is_active", true)
      .eq("type", "sell")
      .eq("currency", "EUR")
      .order("created_at", { ascending: false })
      .limit(6);
    setListings(data || []);
    setLoading(false);
  }

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
      <div style={{ height: 48 }} />
      <Ticker price={price} change={change24h} />

      <main className="max-w-6xl mx-auto px-6 pt-10 pb-8">

        {/* Hero — price + marketplace CTA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 fade-up">
          <div>
            <div className="font-mono text-xs tracking-widest uppercase mb-2"
              style={{ fontFamily: "var(--font-mono)", color: "#777" }}>
              Monero — XMR / USD
            </div>
            <div className="flex items-baseline gap-4 flex-wrap">
              <span className="font-display text-6xl md:text-7xl font-800"
                style={{ fontFamily: "var(--font-display)", fontWeight: 800, letterSpacing: "-0.02em", color: "#F5ECD7" }}>
                {price ? `$${price.toFixed(2)}` : "—"}
              </span>
              {change24h !== null && (
                <span className="font-mono text-xl font-medium"
                  style={{ fontFamily: "var(--font-mono)", color: isPositive ? "#22c55e" : "#ef4444" }}>
                  {isPositive ? "▲" : "▼"} {Math.abs(change24h).toFixed(2)}%
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/marketplace/create"
              className="bg-[#FF6600] hover:bg-[#e55a00] text-black font-bold px-6 py-3 rounded-xl text-sm transition-colors"
              style={{ fontFamily: "var(--font-mono)" }}>
              + Post Offer
            </Link>
            <Link href="/marketplace"
              className="border border-zinc-700 hover:border-zinc-500 text-white px-6 py-3 rounded-xl text-sm transition-colors"
              style={{ fontFamily: "var(--font-mono)" }}>
              Browse All →
            </Link>
          </div>
        </div>

        {/* Stats row — compact */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10 fade-up">
          {[
            { label: "Market Cap", value: formatBig(marketCap) },
            { label: "24H Volume", value: formatBig(volume) },
            { label: "Avg Network Fee", value: "~$0.02" },
            { label: "Ring Size", value: "16" },
          ].map((s) => (
            <div key={s.label} className="border border-zinc-900 px-4 py-3 rounded-lg" style={{ background: "#0a0a0a" }}>
              <div className="font-mono text-xs tracking-widest uppercase mb-1" style={{ color: "#777" }}>{s.label}</div>
              <div className="font-mono text-lg font-medium" style={{ color: "#F5ECD7" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* MARKETPLACE — main section */}
        <div className="mb-10 fade-up">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold text-white">P2P Marketplace</h2>
              <p className="text-sm mt-1" style={{ color: "#777" }}>
                Buy and sell Monero privately. No KYC. Escrow protected.
              </p>
            </div>
            <Link href="/marketplace"
              className="font-mono text-xs tracking-widest text-[#FF6600] hover:text-white transition-colors"
              style={{ fontFamily: "var(--font-mono)" }}>
              VIEW ALL →
            </Link>
          </div>

          {/* Buy/Sell toggle */}
          <div className="flex gap-2 mb-5">
            <Link href="/marketplace?type=sell"
              className="px-5 py-2 rounded-lg text-sm font-bold bg-[#FF6600] text-black transition-colors">
              Buy XMR
            </Link>
            <Link href="/marketplace?type=buy"
              className="px-5 py-2 rounded-lg text-sm font-bold border border-zinc-800 text-zinc-400 hover:text-white transition-colors">
              Sell XMR
            </Link>
          </div>

          {/* Live listings grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="border border-zinc-900 rounded-xl p-5 animate-pulse" style={{ background: "#0a0a0a", height: 180 }} />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="border border-zinc-900 rounded-xl p-12 text-center" style={{ background: "#0a0a0a" }}>
              <p style={{ color: "#555" }} className="mb-4">No offers yet — be the first!</p>
              <Link href="/marketplace/create"
                className="bg-[#FF6600] hover:bg-[#e55a00] text-black font-bold px-6 py-3 rounded-xl text-sm transition-colors">
                Post First Offer →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map(listing => {
                const pm = getPaymentMethod(listing.payment_method);
                const curr = getCurrency(listing.currency);
                const repTotal = listing.profiles.positive_feedback + listing.profiles.negative_feedback;
                const repScore = repTotal > 0 ? Math.round((listing.profiles.positive_feedback / repTotal) * 100) : 100;
                const effectivePrice = price ? (price * 0.92) * (1 + listing.margin / 100) : null;

                return (
                  <Link key={listing.id} href={`/marketplace/${listing.id}`}
                    className="border border-zinc-900 hover:border-zinc-700 rounded-xl p-5 block transition-all hover:translate-y-[-2px]"
                    style={{ background: "#0a0a0a" }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center font-bold text-sm text-[#FF6600]">
                          {listing.profiles.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{listing.profiles.username}</p>
                          <p className="text-xs" style={{ color: "#666" }}>{listing.profiles.trade_count} trades</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${listing.profiles.is_online ? 'bg-green-400' : 'bg-zinc-700'}`} />
                        <span className="text-xs" style={{ color: "#555" }}>{listing.profiles.is_online ? 'online' : 'offline'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs bg-[#FF6600]/10 text-[#FF6600] px-2 py-0.5 rounded-md font-bold">SELLING XMR</span>
                      <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: "#111", color: "#888" }}>{pm.icon} {pm.label}</span>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[#FF6600] font-bold text-xl">
                          {effectivePrice ? `€${effectivePrice.toLocaleString('en', { maximumFractionDigits: 0 })}` : '—'}
                          <span className="text-sm font-normal ml-1" style={{ color: "#555" }}>/XMR</span>
                        </p>
                        <p className="text-xs" style={{ color: "#555" }}>
                          {listing.margin > 0 ? `+${listing.margin}%` : listing.margin < 0 ? `${listing.margin}%` : 'at market'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white">€{listing.min_amount}–€{listing.max_amount}</p>
                        <p className="text-xs" style={{ color: "#555" }}>limit</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {listings.length > 0 && (
            <div className="text-center mt-6">
              <Link href="/marketplace"
                className="border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white px-8 py-3 rounded-xl text-sm transition-colors inline-block">
                View all offers →
              </Link>
            </div>
          )}
        </div>

        {/* Bottom cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 fade-up">
          {[
            { href: "/swap", tag: "Beginner", title: "How to get XMR", desc: "No-KYC step-by-step guide to buying Monero privately.", cta: "Read guide →" },
            { href: "/guides", tag: "Learn", title: "Monero Guides", desc: "Wallets, nodes, mining, privacy — everything explained clearly.", cta: "Browse guides →" },
            { href: "/news", tag: "Latest", title: "Community News", desc: "What's happening in the Monero ecosystem right now.", cta: "See news →" },
          ].map((card) => (
            <Link key={card.href} href={card.href}
              className="border p-6 block transition-all duration-200"
              style={{ background: "#0a0a0a", borderColor: "#1a1a1a", borderRadius: "0.75rem" }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(255,102,0,0.3)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "#1a1a1a"}>
              <div className="font-mono text-xs tracking-widest uppercase mb-3"
                style={{ fontFamily: "var(--font-mono)", color: "var(--xmr)", opacity: 0.7 }}>
                {card.tag}
              </div>
              <div className="text-lg font-600 mb-2"
                style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "#F5ECD7" }}>
                {card.title}
              </div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "#888" }}>{card.desc}</p>
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
