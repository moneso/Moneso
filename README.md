# mone.so — Monero Toolkit

A fast, privacy-first toolkit for the Monero ecosystem.
Built with Next.js 14 + Tailwind CSS. Deploys to Vercel in one click.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + custom CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Price Data**: CoinGecko API (free tier)
- **Hosting**: Vercel

---

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# 3. Open in browser
http://localhost:3000
```

---

## Deploy to Vercel

### Option A — GitHub (recommended)

1. Push this project to a GitHub repository
2. Go to vercel.com → New Project
3. Import your GitHub repo
4. Click Deploy — that's it

Vercel auto-detects Next.js. No configuration needed.

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel
```

---

## Connect your domain (mone.so)

1. In Vercel dashboard → your project → Settings → Domains
2. Add `mone.so` and `www.mone.so`
3. Vercel gives you DNS records to add at your registrar
4. SSL is automatic

---

## Project Structure

```
src/
├── app/
│   ├── layout.js          # Root layout + metadata
│   ├── page.js            # Home — live price + chart + calculator
│   ├── globals.css        # Global styles + fonts
│   ├── swap/
│   │   └── page.js        # How to buy XMR guide
│   ├── guides/
│   │   └── page.js        # Guides index
│   └── news/
│       └── page.js        # News feed
└── components/
    ├── Navbar.jsx          # Fixed top navigation
    ├── Ticker.jsx          # Scrolling price ticker
    ├── PriceChart.jsx      # Interactive price chart (Recharts + CoinGecko)
    ├── FeeCalculator.jsx   # XMR fee calculator
    └── Footer.jsx          # Site footer
```

---

## Phase 2 Ideas (build after launch)

- [ ] Individual guide pages with full content
- [ ] Swap aggregator (compare Trocador, Haveno rates live)
- [ ] XMR to fiat converter widget
- [ ] Email newsletter for news updates
- [ ] Community forum or Discord integration
- [ ] P2P escrow tool (Phase 2 of Moneso)

---

## CoinGecko API

Free tier has a rate limit of ~30 calls/minute.
The home page fetches price every 30 seconds.
The chart fetches once per page load.

For higher traffic, consider:
- CoinGecko Pro API (paid)
- Caching prices in a Vercel Edge Function or KV store

---

## Notes

- No cookies, no analytics, no tracking — by design
- All price data attributed to CoinGecko in the footer
- Not financial advice

