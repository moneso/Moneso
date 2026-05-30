"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Markets" },
  { href: "/swap", label: "How to Buy" },
  { href: "/guides", label: "Guides" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/news", label: "News" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border"
      style={{ background: "rgba(6,6,6,0.92)", backdropFilter: "blur(12px)" }}>
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-baseline gap-1 group">
          <span className="font-display text-2xl font-700 text-bright tracking-tight"
            style={{ fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: "-0.01em" }}>
            MONE
          </span>
          <span className="font-mono text-sm" style={{ color: "var(--xmr)", fontFamily: "var(--font-mono)" }}>
            .SO
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-8">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link font-mono text-xs tracking-widest uppercase transition-colors duration-200 ${
                pathname === href ? "text-bright active" : "text-muted hover:text-soft"
              }`}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#22c55e" }} />
          <span className="font-mono text-xs text-muted tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
            LIVE
          </span>
        </div>

      </div>
    </nav>
  );
}
