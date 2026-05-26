"use client";

import { useState } from "react";

export default function FeeCalculator({ price }) {
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("xmr"); // xmr or usd
  const [result, setResult] = useState(null);

  const NETWORK_FEE_XMR = 0.00012;
  const KRAKEN_FEE = 0.0026;
  const TROCADOR_FEE = 0.003;

  const calculate = () => {
    let xmr;
    if (mode === "xmr") {
      xmr = parseFloat(amount);
    } else {
      xmr = parseFloat(amount) / (price || 187);
    }
    if (!xmr || xmr <= 0) return;

    const usd = xmr * (price || 187);
    const networkFeeUsd = NETWORK_FEE_XMR * (price || 187);
    const krakenFeeXmr = xmr * KRAKEN_FEE;
    const trocadorFeeXmr = xmr * TROCADOR_FEE;
    const totalFeeXmr = NETWORK_FEE_XMR + krakenFeeXmr;
    const youReceive = xmr - totalFeeXmr;

    setResult({ xmr, usd, networkFeeUsd, krakenFeeXmr, trocadorFeeXmr, totalFeeXmr, youReceive });
  };

  return (
    <div className="border border-border" style={{ background: "#0a0a0a" }}>
      <div className="px-6 py-4 border-b border-border">
        <span className="font-mono text-xs tracking-widest text-muted uppercase"
          style={{ fontFamily: "var(--font-mono)" }}>
          Fee Calculator
        </span>
      </div>

      <div className="p-6 space-y-5">
        {/* Mode toggle */}
        <div className="flex gap-1 p-1 border border-border" style={{ width: "fit-content" }}>
          {["xmr", "usd"].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setResult(null); }}
              className="font-mono text-xs tracking-widest px-4 py-1.5 transition-all duration-150 uppercase"
              style={{
                fontFamily: "var(--font-mono)",
                background: mode === m ? "rgba(255,102,0,0.12)" : "transparent",
                color: mode === m ? "var(--xmr)" : "#444",
              }}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Input row */}
        <div className="flex gap-3">
          <div className="flex-1 flex items-center border border-border px-4"
            style={{ background: "#060606" }}>
            <span className="font-mono text-xs text-muted mr-3 uppercase"
              style={{ fontFamily: "var(--font-mono)" }}>
              {mode === "xmr" ? "XMR" : "USD"}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setResult(null); }}
              placeholder={mode === "xmr" ? "0.00" : "0.00"}
              className="flex-1 bg-transparent py-3 text-bright font-mono text-sm outline-none"
              style={{ fontFamily: "var(--font-mono)", color: "#F5ECD7" }}
            />
          </div>
          <button
            onClick={calculate}
            className="px-5 py-3 font-mono text-xs tracking-widest uppercase transition-all"
            style={{
              fontFamily: "var(--font-mono)",
              background: "rgba(255,102,0,0.1)",
              border: "1px solid rgba(255,102,0,0.3)",
              color: "#FF6600",
            }}
          >
            Calc
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-0 border border-border">
            {[
              { label: "Send", value: `${result.xmr.toFixed(5)} XMR ($${result.usd.toFixed(2)})` },
              { label: "Network fee", value: `${NETWORK_FEE_XMR} XMR (~$${result.networkFeeUsd.toFixed(4)})`, dim: true },
              { label: "Kraken fee (0.26%)", value: `${result.krakenFeeXmr.toFixed(6)} XMR`, dim: true },
              { label: "You receive", value: `${result.youReceive.toFixed(5)} XMR`, highlight: true },
            ].map((row) => (
              <div key={row.label}
                className="flex justify-between items-center px-4 py-3 border-b border-border last:border-0">
                <span className="font-mono text-xs tracking-widest uppercase"
                  style={{ fontFamily: "var(--font-mono)", color: "#444" }}>
                  {row.label}
                </span>
                <span className="font-mono text-xs"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: row.highlight ? "#22c55e" : row.dim ? "#555" : "#C8B99A",
                  }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <p className="text-xs text-muted leading-relaxed" style={{ color: "#3a3a3a" }}>
          Estimates based on Kraken spot fee (0.26%) + standard network fee. Actual fees may vary.
        </p>
      </div>
    </div>
  );
}
