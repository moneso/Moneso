import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Monero News — mone.so",
  description: "Latest news and updates from the Monero ecosystem.",
};

const news = [
  {
    title: "RetoSwap suspends trading after $2.7M exploit in Haveno protocol",
    source: "CryptoTimes",
    date: "May 21, 2026",
    tag: "Security",
    desc: "Attackers exploited a flaw in Haveno's trade messaging system, allowing them to pose as an arbitrator before funds entered a multisig wallet. Platform is paused while developers investigate.",
    href: "https://www.cryptotimes.io",
    important: true,
  },
  {
    title: "Monero community votes to reduce default ring size in upcoming hard fork",
    source: "GetMonero.org",
    date: "May 12, 2026",
    tag: "Protocol",
    desc: "The community forum reached consensus on adjusting the minimum ring size as part of the next network upgrade, with an expected activation in Q3 2026.",
    href: "https://getmonero.org",
  },
  {
    title: "KuCoin confirms XMR withdrawals remain open for EU users despite MiCA pressure",
    source: "CoinDesk",
    date: "May 5, 2026",
    tag: "Regulation",
    desc: "KuCoin issued a statement confirming that Monero trading remains available for most European users, though it noted the situation is subject to ongoing regulatory review.",
    href: "https://coindesk.com",
  },
  {
    title: "Cake Wallet 5.0 ships with improved Tor integration and faster sync",
    source: "Cake Labs",
    date: "Apr 28, 2026",
    tag: "Wallets",
    desc: "The major update brings a significantly faster blockchain scan speed, tighter Tor-by-default integration, and a redesigned transaction history screen for both iOS and Android.",
    href: "https://cakewallet.com",
  },
  {
    title: "Community Crowdfunding System approves three new developer proposals",
    source: "CCS",
    date: "Apr 20, 2026",
    tag: "Community",
    desc: "Three development proposals totalling over 800 XMR were approved, covering wallet improvements, network monitoring tooling, and documentation updates.",
    href: "https://ccs.getmonero.org",
  },
  {
    title: "Trocador adds support for 12 new swap pairs including XMR/LTC and XMR/USDC",
    source: "Trocador",
    date: "Apr 10, 2026",
    tag: "Exchanges",
    desc: "The no-KYC swap aggregator expanded its Monero routing options, making it easier to convert a wider range of assets to XMR without identity requirements.",
    href: "https://trocador.app",
  },
];

const tagColors = {
  Security: { bg: "rgba(239,68,68,0.08)", color: "#ef4444", border: "rgba(239,68,68,0.2)" },
  Protocol: { bg: "rgba(168,85,247,0.08)", color: "#a855f7", border: "rgba(168,85,247,0.2)" },
  Regulation: { bg: "rgba(245,197,24,0.08)", color: "#f5c518", border: "rgba(245,197,24,0.2)" },
  Wallets: { bg: "rgba(59,130,246,0.08)", color: "#3b82f6", border: "rgba(59,130,246,0.2)" },
  Community: { bg: "rgba(34,197,94,0.08)", color: "#22c55e", border: "rgba(34,197,94,0.2)" },
  Exchanges: { bg: "rgba(255,102,0,0.08)", color: "var(--xmr)", border: "rgba(255,102,0,0.2)" },
};

export default function NewsPage() {
  return (
    <div className="min-h-screen" style={{ background: "#060606" }}>
      <Navbar />
      <div style={{ height: 48 }} />

      <main className="max-w-3xl mx-auto px-6 pt-16 pb-8">

        {/* Header */}
        <div className="mb-14">
          <div className="font-mono text-xs tracking-widest uppercase mb-3"
            style={{ fontFamily: "var(--font-mono)", color: "var(--xmr)", opacity: 0.7 }}>
            Community Updates
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-800 text-bright mb-4"
            style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: "#F5ECD7", lineHeight: 1.05 }}>
            Monero News
          </h1>
          <p className="text-base" style={{ color: "#555" }}>
            What's happening in the XMR ecosystem. Curated, no noise.
          </p>
        </div>

        {/* Feed */}
        <div className="space-y-3">
          {news.map((item, i) => {
            const tc = tagColors[item.tag] || tagColors.Exchanges;
            return (
              <a key={i} href={item.href} target="_blank" rel="noopener noreferrer"
                className="block border p-6 transition-colors"
                style={{
                  background: "#0a0a0a",
                  borderColor: item.important ? "rgba(239,68,68,0.25)" : "#1a1a1a",
                  textDecoration: "none",
                }}>
                <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs px-2 py-0.5"
                      style={{
                        fontFamily: "var(--font-mono)",
                        background: tc.bg,
                        color: tc.color,
                        border: `1px solid ${tc.border}`,
                      }}>
                      {item.tag}
                    </span>
                    {item.important && (
                      <span className="font-mono text-xs"
                        style={{ fontFamily: "var(--font-mono)", color: "#ef4444" }}>
                        ⚠ Important
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs"
                    style={{ fontFamily: "var(--font-mono)", color: "#333" }}>
                    {item.date}
                  </span>
                </div>

                <h2 className="font-display text-lg font-600 mb-2 leading-snug"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "#C8B99A" }}>
                  {item.title}
                </h2>

                <p className="text-sm leading-relaxed mb-3" style={{ color: "#444" }}>
                  {item.desc}
                </p>

                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs"
                    style={{ fontFamily: "var(--font-mono)", color: "#333" }}>
                    {item.source}
                  </span>
                  <span className="font-mono text-xs"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--xmr)", opacity: 0.5 }}>
                    Read ↗
                  </span>
                </div>
              </a>
            );
          })}
        </div>

      </main>

      <Footer />
    </div>
  );
}
