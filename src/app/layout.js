import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: "mone.so — Monero Toolkit",
  description: "Price data, fee calculators, swap guides and community news for the Monero ecosystem. No tracking. No ads. Privacy first.",
  keywords: ["monero", "XMR", "privacy", "cryptocurrency", "P2P", "no-kyc"],
  openGraph: {
    title: "mone.so — Monero Toolkit",
    description: "Price data, tools and guides for the Monero ecosystem.",
    url: "https://mone.so",
    siteName: "mone.so",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}<Analytics /></body>
    </html>
  );
}
