"use client";

import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="border border-border px-4 py-3"
      style={{ background: "#0f0f0f", fontFamily: "var(--font-mono)" }}>
      <div className="text-xs text-muted tracking-widest mb-1">{payload[0]?.payload?.date}</div>
      <div className="text-base" style={{ color: "var(--xmr)" }}>
        ${parseFloat(payload[0]?.value).toFixed(2)}
      </div>
    </div>
  );
};

export default function PriceChart() {
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState("30");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(
      `https://api.coingecko.com/api/v3/coins/monero/market_chart?vs_currency=usd&days=${period}`
    )
      .then((r) => r.json())
      .then((json) => {
        if (!json.prices) return;
        const formatted = json.prices.map(([ts, price]) => ({
          date: new Date(ts).toLocaleDateString("en-GB", {
            month: "short", day: "numeric",
          }),
          price: price.toFixed(4),
          ts,
        }));
        // Reduce to max ~60 data points for cleanliness
        const step = Math.max(1, Math.floor(formatted.length / 60));
        setData(formatted.filter((_, i) => i % step === 0));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [period]);

  const min = data.length ? Math.min(...data.map((d) => parseFloat(d.price))) * 0.98 : 0;
  const max = data.length ? Math.max(...data.map((d) => parseFloat(d.price))) * 1.02 : 0;

  const periods = [
    { label: "7D", value: "7" },
    { label: "30D", value: "30" },
    { label: "90D", value: "90" },
    { label: "1Y", value: "365" },
  ];

  return (
    <div className="border border-border" style={{ background: "#0a0a0a" }}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <span className="font-mono text-xs tracking-widest text-muted uppercase"
          style={{ fontFamily: "var(--font-mono)" }}>
          XMR / USD — Price History
        </span>
        <div className="flex gap-1">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className="font-mono text-xs tracking-widest px-3 py-1 transition-all duration-150"
              style={{
                fontFamily: "var(--font-mono)",
                background: period === p.value ? "rgba(255,102,0,0.12)" : "transparent",
                color: period === p.value ? "var(--xmr)" : "#444",
                border: period === p.value ? "1px solid rgba(255,102,0,0.3)" : "1px solid transparent",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-2 py-4" style={{ height: 280 }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="font-mono text-xs text-muted animate-pulse tracking-widest"
              style={{ fontFamily: "var(--font-mono)" }}>
              LOADING CHART DATA...
            </span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="xmrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6600" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#FF6600" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#111" strokeDasharray="0" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "#444", fontSize: 10, fontFamily: "var(--font-mono)" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                tickCount={6}
              />
              <YAxis
                domain={[min, max]}
                tick={{ fill: "#444", fontSize: 10, fontFamily: "var(--font-mono)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${parseFloat(v).toFixed(0)}`}
                width={52}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#333", strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#FF6600"
                strokeWidth={1.5}
                fill="url(#xmrGrad)"
                dot={false}
                activeDot={{ r: 3, fill: "#FF6600", stroke: "#FF6600" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
