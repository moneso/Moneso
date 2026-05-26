import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "How to Buy Monero (XMR) Without KYC — mone.so",
  description: "Step-by-step guide to buying Monero privately in 2025. No KYC required.",
};

const steps = [
  {
    n: "01",
    title: "Open an account on Kraken",
    time: "10 min",
    body: "Kraken is one of the few major exchanges that still supports XMR deposits and withdrawals. Create an account at kraken.com and complete basic verification (email + phone). You do not need full ID verification for small amounts on Kraken.",
    note: "KuCoin is an alternative for international users.",
    link: { label: "kraken.com", href: "https://kraken.com" },
  },
  {
    n: "02",
    title: "Deposit fiat via SEPA or card",
    time: "5 min",
    body: "UK and EU users: use SEPA bank transfer for zero or near-zero fees. Funds arrive in 1–2 business days. Card deposits are faster but carry a higher fee (~1.5%). Minimum deposit is typically $10 / £10 / €10.",
    note: "SEPA is free on Kraken. Card adds ~1.5% fee.",
  },
  {
    n: "03",
    title: "Buy XMR directly on Kraken",
    time: "2 min",
    body: "Go to Trade → XMR/USD (or XMR/EUR). Use a market order if you want instant execution, or a limit order if you want a specific price. Kraken charges 0.26% for market orders.",
    note: "Always double-check you're on the XMR pair, not a similar ticker.",
  },
  {
    n: "04",
    title: "Withdraw to Cake Wallet",
    time: "5 min",
    body: "Never leave XMR on an exchange longer than necessary. Download Cake Wallet (iOS / Android), create a new wallet, and copy your receive address. In Kraken, go to Funding → Withdraw → XMR, paste your address, and confirm. Transactions typically confirm in 2–20 minutes.",
    note: "Use a new subaddress (starting with 8) each time for better privacy.",
    link: { label: "cakewallet.com", href: "https://cakewallet.com" },
  },
];

const alternatives = [
  {
    name: "Trocador",
    desc: "Swap BTC, LTC, ETH → XMR instantly. No account, no KYC. Best for crypto-to-crypto.",
    href: "https://trocador.app",
    tag: "No KYC",
  },
  {
    name: "Haveno DEX",
    desc: "Decentralized P2P exchange. Buy XMR with bank transfer or cash. No central operator.",
    href: "https://haveno.exchange",
    tag: "Decentralized",
  },
  {
    name: "Bisq",
    desc: "Buy BTC with fiat, then swap to XMR via the XMR/BTC pair. No KYC required.",
    href: "https://bisq.network",
    tag: "No KYC",
  },
];

export default function SwapPage() {
  return (
    <div className="min-h-screen" style={{ background: "#060606" }}>
      <Navbar />
      <div style={{ height: 48 }} />

      <main className="max-w-3xl mx-auto px-6 pt-16 pb-8">

        {/* Header */}
        <div className="mb-14">
          <div className="font-mono text-xs tracking-widest uppercase mb-3"
            style={{ fontFamily: "var(--font-mono)", color: "var(--xmr)", opacity: 0.7 }}>
            Beginners Guide
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-800 text-bright mb-4"
            style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: "#F5ECD7", lineHeight: 1.05 }}>
            How to Buy<br />Monero
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "#555", maxWidth: 480 }}>
            The fastest route to XMR with minimal friction. No complicated setups. Updated for 2025.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-14">
          {steps.map((step) => (
            <div key={step.n} className="border border-border"
              style={{ background: "#0a0a0a" }}>
              <div className="flex items-center gap-4 px-6 py-4 border-b border-border">
                <span className="font-mono text-2xl font-300"
                  style={{ fontFamily: "var(--font-mono)", color: "rgba(255,102,0,0.25)", minWidth: 36 }}>
                  {step.n}
                </span>
                <span className="font-display text-lg font-600 text-bright flex-1"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "#F5ECD7" }}>
                  {step.title}
                </span>
                <span className="font-mono text-xs tracking-widest"
                  style={{ fontFamily: "var(--font-mono)", color: "#333" }}>
                  ~{step.time}
                </span>
              </div>
              <div className="px-6 py-5">
                <p className="text-sm leading-relaxed mb-3" style={{ color: "#666" }}>{step.body}</p>
                {step.note && (
                  <div className="text-xs px-3 py-2 border-l-2"
                    style={{ borderColor: "rgba(255,102,0,0.4)", background: "rgba(255,102,0,0.05)", color: "#888" }}>
                    {step.note}
                  </div>
                )}
                {step.link && (
                  <a href={step.link.href} target="_blank" rel="noopener noreferrer"
                    className="inline-block mt-3 font-mono text-xs tracking-widest"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--xmr)", opacity: 0.7 }}>
                    {step.link.label} ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Alternatives */}
        <div className="mb-12">
          <div className="font-mono text-xs tracking-widest uppercase mb-5"
            style={{ fontFamily: "var(--font-mono)", color: "#333" }}>
            Alternative Routes
          </div>
          <div className="space-y-3">
            {alternatives.map((alt) => (
              <a key={alt.name} href={alt.href} target="_blank" rel="noopener noreferrer"
                className="flex items-start gap-5 border border-border p-5 block transition-colors"
                style={{ background: "#0a0a0a", textDecoration: "none" }}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-display text-base font-600 text-bright"
                      style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "#C8B99A" }}>
                      {alt.name}
                    </span>
                    <span className="font-mono text-xs px-2 py-0.5"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--xmr)",
                        background: "rgba(255,102,0,0.1)",
                        border: "1px solid rgba(255,102,0,0.2)",
                      }}>
                      {alt.tag}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: "#444" }}>{alt.desc}</p>
                </div>
                <span className="text-muted text-sm" style={{ color: "#333" }}>↗</span>
              </a>
            ))}
          </div>
        </div>

        {/* Warning */}
        <div className="border border-border p-5 text-xs leading-relaxed"
          style={{ background: "rgba(255,102,0,0.03)", borderColor: "rgba(255,102,0,0.15)", color: "#555" }}>
          <span style={{ color: "var(--xmr)" }}>Note: </span>
          Availability of XMR trading varies by country. Always check that your exchange allows XMR withdrawals before depositing funds. Regulatory conditions change — verify current status before trading.
        </div>

      </main>

      <Footer />
    </div>
  );
}
