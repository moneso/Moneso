import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Monero Guides — mone.so",
  description: "Wallets, nodes, mining, privacy — everything Monero explained clearly.",
};

const guides = [
  {
    tag: "Beginner",
    title: "What is Monero?",
    desc: "Why Monero exists, how it differs from Bitcoin, and why financial privacy matters. Start here if you're new.",
    time: "5 min read",
    slug: "what-is-monero",
    ready: true,
  },
  {
    tag: "Wallets",
    title: "Setting up Cake Wallet",
    desc: "The most user-friendly Monero mobile wallet. Step-by-step setup for iOS and Android.",
    time: "8 min read",
    slug: "cake-wallet-setup",
    ready: true,
  },
  {
    tag: "Privacy",
    title: "Ring Signatures Explained",
    desc: "How Monero hides your transaction in plain English — no cryptography degree required.",
    time: "6 min read",
    slug: "ring-signatures",
    ready: true,
  },
  {
    tag: "Mining",
    title: "Mining XMR with Your CPU",
    desc: "RandomX is designed for consumer CPUs. How to get started with XMRig on Windows, Mac, or Linux.",
    time: "12 min read",
    slug: "cpu-mining",
    ready: true,
  },
  {
    tag: "Advanced",
    title: "Running Your Own Node",
    desc: "Why self-hosting a full node is the gold standard for privacy, and how to do it on a Raspberry Pi or VPS.",
    time: "15 min read",
    slug: "run-a-node",
    ready: false,
  },
  {
    tag: "Swaps",
    title: "Crypto → XMR: No KYC Routes",
    desc: "Using Trocador, Bisq, and atomic swaps to convert Bitcoin or Litecoin into Monero without identity checks.",
    time: "10 min read",
    slug: "no-kyc-swaps",
    ready: false,
  },
  {
    tag: "Security",
    title: "Monero + Hardware Wallets",
    desc: "Using Ledger or Trezor with Monero GUI for maximum security. What works and what doesn't.",
    time: "10 min read",
    slug: "hardware-wallets",
    ready: false,
  },
  {
    tag: "Community",
    title: "Getting Paid in XMR",
    desc: "How freelancers and businesses accept Monero payments, generate invoices, and handle accounting.",
    time: "8 min read",
    slug: "getting-paid-in-xmr",
    ready: false,
  },
];

const tagColors = {
  Beginner: { bg: "rgba(34,197,94,0.08)", color: "#22c55e", border: "rgba(34,197,94,0.2)" },
  Wallets: { bg: "rgba(59,130,246,0.08)", color: "#3b82f6", border: "rgba(59,130,246,0.2)" },
  Privacy: { bg: "rgba(168,85,247,0.08)", color: "#a855f7", border: "rgba(168,85,247,0.2)" },
  Mining: { bg: "rgba(245,197,24,0.08)", color: "#f5c518", border: "rgba(245,197,24,0.2)" },
  Advanced: { bg: "rgba(255,102,0,0.08)", color: "var(--xmr)", border: "rgba(255,102,0,0.2)" },
  Swaps: { bg: "rgba(20,184,166,0.08)", color: "#14b8a6", border: "rgba(20,184,166,0.2)" },
  Security: { bg: "rgba(239,68,68,0.08)", color: "#ef4444", border: "rgba(239,68,68,0.2)" },
  Community: { bg: "rgba(245,197,24,0.08)", color: "#f5c518", border: "rgba(245,197,24,0.2)" },
};

export default function GuidesPage() {
  return (
    <div className="min-h-screen" style={{ background: "#060606" }}>
      <Navbar />
      <div style={{ height: 48 }} />

      <main className="max-w-5xl mx-auto px-6 pt-16 pb-8">

        {/* Header */}
        <div className="mb-14">
          <div className="font-mono text-xs tracking-widest uppercase mb-3"
            style={{ fontFamily: "var(--font-mono)", color: "var(--xmr)", opacity: 0.7 }}>
            Documentation
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-800 text-bright mb-4"
            style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: "#F5ECD7", lineHeight: 1.05 }}>
            Monero Guides
          </h1>
          <p className="text-base" style={{ color: "#555" }}>
            Everything you need to use Monero confidently — wallets, privacy, mining, and more.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {guides.map((guide) => {
            const tc = tagColors[guide.tag] || tagColors.Advanced;
            return (
              <div key={guide.slug}
                className="border border-border p-6 relative"
                style={{
                  background: "#0a0a0a",
                  opacity: guide.ready ? 1 : 0.5,
                  cursor: guide.ready ? "pointer" : "default",
                }}>

                {/* Tag + time */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs px-2 py-0.5"
                    style={{
                      fontFamily: "var(--font-mono)",
                      background: tc.bg,
                      color: tc.color,
                      border: `1px solid ${tc.border}`,
                    }}>
                    {guide.tag}
                  </span>
                  <span className="font-mono text-xs"
                    style={{ fontFamily: "var(--font-mono)", color: "#333" }}>
                    {guide.ready ? guide.time : "Coming soon"}
                  </span>
                </div>

                <h2 className="font-display text-xl font-600 mb-2"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "#C8B99A" }}>
                  {guide.title}
                </h2>
                <p className="text-sm leading-relaxed"
                  style={{ color: "#444" }}>
                  {guide.desc}
                </p>

                {guide.ready && (
                  <div className="mt-5 font-mono text-xs tracking-widest"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--xmr)", opacity: 0.6 }}>
                    Read →
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
