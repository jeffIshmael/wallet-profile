"use client";

import { clsx } from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useWalletData } from "@/hooks/useWalletData";
import { useWalletAuth } from "@/hooks/useWalletAuth";

type AssetKey = "CELO" | "USDm" | "USDC" | "USDT";

const allTokens: { key: AssetKey; label: string }[] = [
  { key: "CELO", label: "CELO" },
  { key: "USDm", label: "USDm" },
  { key: "USDC", label: "USDC" },
  { key: "USDT", label: "USDT" }
];

const minipayTokens = allTokens.filter((token) => token.key !== "CELO");

const ROTATE_MS = 4000;

export function GrowthJourneyChart() {
  const { miniPay } = useWalletAuth();
  const { walletData } = useWalletData();
  const tokenCycle = miniPay ? minipayTokens : allTokens;
  const [tokenIndex, setTokenIndex] = useState(0);
  const rotateRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const asset = tokenCycle[tokenIndex];
  const fullData = walletData?.growthHistory[asset.key] ?? [];

  const chartData = useMemo(() => fullData.slice(-3), [fullData]);

  useEffect(() => {
    rotateRef.current = setInterval(() => {
      setTokenIndex((prev) => (prev + 1) % tokenCycle.length);
    }, ROTATE_MS);
    return () => {
      if (rotateRef.current) clearInterval(rotateRef.current);
    };
  }, []);

  if (!walletData) return null;

  function selectToken(index: number) {
    setTokenIndex(index);
    if (rotateRef.current) clearInterval(rotateRef.current);
    rotateRef.current = setInterval(() => {
      setTokenIndex((prev) => (prev + 1) % tokenCycle.length);
    }, ROTATE_MS);
  }

  const latest = chartData[chartData.length - 1]?.value ?? 0;
  const start = chartData[0]?.value ?? latest;
  const changePct = start > 0 ? (((latest - start) / start) * 100).toFixed(1) : "0";
  const change = latest - start;

  return (
    <Card compact className="flex h-full flex-col">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <SectionHeader
          compact
          title="Financial Growth"
          help={{
            meaning: "Running balance over time — deposits push the line up, spending pulls it down.",
            calculation: "Reconstructed from your indexed Celo transfers, anchored to your current holdings.",
            lenderRelevance: "Upward trends signal financial growth and improving creditworthiness."
          }}
        />

      </div>

      <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-lg font-bold text-white">{asset.label}</span>
          <span className="font-mono text-lg font-bold text-white">
            {latest >= 1000 ? `$${latest.toLocaleString()}` : `$${latest.toFixed(3)}`}
          </span>
          <span className={`text-xs font-semibold ${change >= 0 ? "text-teal" : "text-danger"}`}>
            {change >= 0 ? "+" : ""}
            {changePct}%
          </span>
        </div>
        <div className="flex gap-1">
          {tokenCycle.map(({ key, label }, i) => (
            <button
              key={key}
              type="button"
              onClick={() => selectToken(i)}
              className={clsx(
                "growth-token-btn rounded-md px-1.5 py-0.5 text-[10px] font-semibold transition",
                i === tokenIndex
                  ? "bg-btc-orange/20 font-bold text-btc-orange"
                  : "text-stardust hover:bg-white/5 hover:text-btc-orange"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-1 h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={[...chartData]} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00d4aa" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#00d4aa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              tick={{ fill: "#64748b", fontSize: 9 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={42}
              tick={{ fill: "#64748b", fontSize: 9 }}
              tickFormatter={(v) => (v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${Number(v).toFixed(2)}`)}
            />
            <Tooltip
              contentStyle={{
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                background: "#0f1115",
                fontSize: 11
              }}
              formatter={(value) => [`$${Number(value).toLocaleString()}`, asset.label]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#00d4aa"
              strokeWidth={2}
              fill="url(#growthGradient)"
              dot={false}
              activeDot={{ r: 4, fill: "#00d4aa", stroke: "#fff", strokeWidth: 1 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
