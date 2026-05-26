import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Brand */}
          <div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="font-display text-xl font-bold text-bright"
                style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
                MONE
              </span>
              <span className="font-mono text-sm" style={{ color: "var(--xmr)", fontFamily: "var(--font-mono)" }}>
                .SO
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed" style={{ color: "#3a3a3a" }}>
              An independent toolkit for the Monero ecosystem. No tracking. No ads. No cookies.
            </p>
          </div>

          {/* Links */}
          <div>
            <div className="font-mono text-xs tracking-widest text-muted uppercase mb-4"
              style={{ fontFamily: "var(--font-mono)", color: "#333" }}>
              Navigate
            </div>
            <div className="flex flex-col gap-2">
              {[
                { href: "/", label: "Markets" },
                { href: "/swap", label: "How to Buy XMR" },
                { href: "/guides", label: "Guides" },
                { href: "/news", label: "News" },
              ].map(({ href, label }) => (
                <Link key={href} href={href}
                  className="text-xs text-muted hover:text-soft transition-colors"
                  style={{ color: "#444" }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* External */}
          <div>
            <div className="font-mono text-xs tracking-widest text-muted uppercase mb-4"
              style={{ fontFamily: "var(--font-mono)", color: "#333" }}>
              Resources
            </div>
            <div className="flex flex-col gap-2">
              {[
                { href: "https://getmonero.org", label: "GetMonero.org" },
                { href: "https://ccs.getmonero.org", label: "Community Crowdfunding" },
                { href: "https://trocador.app", label: "Trocador (Swap)" },
                { href: "https://haveno.exchange", label: "Haveno DEX" },
              ].map(({ href, label }) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                  className="text-xs transition-colors"
                  style={{ color: "#444" }}>
                  {label} ↗
                </a>
              ))}
            </div>
          </div>

        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-mono text-xs" style={{ color: "#2a2a2a", fontFamily: "var(--font-mono)" }}>
            © 2025 mone.so — Not financial advice
          </span>
          <span className="font-mono text-xs" style={{ color: "#2a2a2a", fontFamily: "var(--font-mono)" }}>
            Price data: CoinGecko API
          </span>
        </div>
      </div>
    </footer>
  );
}
