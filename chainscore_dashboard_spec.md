# ChainScore AI — Onchain Reputation Dashboard
## Next.js Build Specification (Blue & White Theme)

> Hand this document to an AI agent (e.g. Claude, GPT-4o) as a complete build prompt.  
> Stack: **Next.js 14 App Router · TypeScript · Tailwind CSS · Recharts · Framer Motion**

---

## 0. Quick-Start Commands

```bash
npx create-next-app@latest chainscore-dashboard \
  --typescript --tailwind --app --src-dir --import-alias "@/*"
cd chainscore-dashboard
npm install recharts framer-motion lucide-react clsx
```

---

## 1. Design System

### 1.1 Color Palette (Blue & White)

```css
/* globals.css — paste inside :root */
--color-bg:           #F0F4FF;      /* page background — very light blue-white */
--color-surface:      #FFFFFF;      /* card background */
--color-surface-2:    #EBF2FF;      /* inset / alt surface */
--color-border:       #D0DEFF;      /* card borders */

--color-primary:      #1A56FF;      /* main brand blue */
--color-primary-dark: #1240CC;      /* hover state */
--color-primary-light:#5B8AFF;      /* tinted accents */
--color-primary-glow: rgba(26,86,255,0.15);

--color-text:         #0D1B4B;      /* headings */
--color-text-muted:   #5B6E9A;      /* secondary labels */
--color-text-faint:   #9AAACB;      /* placeholders */

--color-success:      #0FB27A;      /* green status */
--color-warning:      #F59E0B;      /* amber status */
--color-danger:       #EF4444;      /* red / high risk */
--color-info:         #3B82F6;      /* informational blue */

--radius-card:        16px;
--shadow-card:        0 2px 16px rgba(26,86,255,0.08);
--shadow-card-hover:  0 8px 32px rgba(26,86,255,0.18);
```

### 1.2 Typography

Use **Sora** (headings) + **DM Sans** (body) from Google Fonts.

```html
<!-- in app/layout.tsx <head> -->
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
```

| Role | Font | Weight | Size |
|---|---|---|---|
| Page Title | Sora | 800 | 2.25rem |
| Card Heading | Sora | 700 | 1.125rem |
| Score Number | Sora | 800 | 3rem |
| Body | DM Sans | 400 | 0.9375rem |
| Label/Badge | DM Sans | 600 | 0.75rem |

### 1.3 Motion Tokens

```ts
// All Framer Motion variants share these
export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};
export const stagger = { show: { transition: { staggerChildren: 0.07 } } };
```

---

## 2. File Structure

```
src/
├── app/
│   ├── layout.tsx          ← root layout, Google Fonts, globals.css
│   ├── page.tsx            ← dashboard page (renders <Dashboard />)
│   └── globals.css         ← CSS variables + base styles
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx     ← Chat drawer (desktop: fixed right panel)
│   ├── wallet/
│   │   ├── WalletMetaCard.tsx
│   │   └── ReputationScoreCard.tsx
│   ├── scores/
│   │   ├── FinancialHealthGauge.tsx   ← SVG circular progress
│   │   ├── ScoreBreakdown.tsx         ← accordion sub-scores
│   │   └── LoanCapacityCard.tsx
│   ├── portfolio/
│   │   ├── RiskExposureCard.tsx       ← stacked horizontal bar
│   │   └── PortfolioAllocationBars.tsx
│   ├── income/
│   │   ├── IncomeSummaryCard.tsx      ← tabbed 1M/2M/6M/1Y
│   │   └── TokenFlowTable.tsx
│   ├── growth/
│   │   └── GrowthJourneyChart.tsx     ← Recharts AreaChart sparkline
│   ├── ai/
│   │   ├── AIAnalysisCard.tsx
│   │   └── AttestationModal.tsx
│   ├── chat/
│   │   └── ChatSidebar.tsx            ← X402 micro-billing chat
│   └── ui/
│       ├── Badge.tsx
│       ├── Card.tsx
│       ├── GaugeArc.tsx               ← reusable SVG arc primitive
│       ├── ProgressBar.tsx
│       └── Tooltip.tsx
├── data/
│   └── mockWallet.ts       ← paste JSON from Section 6 here
└── hooks/
    └── useCountUp.ts       ← animated number count-up
```

---

## 3. Page Layout

```
┌──────────────────────────────── HEADER ──────────────────────────────────┐
│  [🔷 ChainScore AI]   [address pill]   [Celo price badge]   [⚙ Settings] │
└──────────────────────────────────────────────────────────────────────────┘

┌─── COL 1 (w-72 fixed) ───┬────── COL 2 (flex-1) ───────┬─ COL 3 (w-80) ─┐
│  WalletMetaCard           │  FinancialHealthGauge        │ IncomeSummary   │
│  ReputationScoreCard      │  ScoreBreakdown              │   (tabbed)      │
│  LoanCapacityCard         │  RiskExposureCard            │                 │
│                           │  IncomeStabilityCard         │ ChatSidebar     │
│                           │  GrowthJourneyChart          │                 │
│                           │  AIAnalysisCard              │                 │
└───────────────────────────┴──────────────────────────────┴─────────────────┘
```

Implement as:
```tsx
// app/page.tsx
<main className="min-h-screen bg-[var(--color-bg)]">
  <Header />
  <div className="grid grid-cols-[288px_1fr_320px] gap-6 px-6 py-6 max-w-[1600px] mx-auto">
    <LeftColumn />
    <CenterColumn />
    <RightColumn />
  </div>
</main>
```

Responsive breakpoints:
- `< 1280px` → collapse to 2-column (hide right col, chat becomes a floating button)
- `< 768px` → single column stacked

---

## 4. Component Specifications

### 4.1 Header

```tsx
// White bar, 1px bottom border var(--color-border), h-16
// Left: Blue hexagon logo + "ChainScore AI" in Sora 700
// Center: address pill — truncated address, copy icon, CeloScan external link
// Right: "CELO $0.061" badge (blue pill), settings icon
```

### 4.2 WalletMetaCard

```tsx
// Card with --color-surface, rounded-2xl, shadow-card
// Top row: blue gradient avatar circle with wallet icon, address, copy + scan icons
// ENS row: italic muted "None registered"
// Wallet Age: bold "22 months" inside gold/amber badge
// Grid 2×2: Total Txns | First Tx date | Last Tx date | Tx Hash (truncated links)
```

### 4.3 ReputationScoreCard

```tsx
// Large "87" in Sora 800, primary blue
// Subtitle badge: "Established Wallet" — filled teal/success background
// GaugeArc SVG: 270° arc, stroke var(--color-primary), animated on mount
// Signal checklist (4 items, green checkmarks):
//   ✓ Wallet Age (22 months)
//   ✓ Clean Security Profile
//   ✓ Transaction Consistency
//   ✓ Low Liquidation Risk
// Rationale text in muted small font
```

### 4.4 FinancialHealthGauge (Hero)

```tsx
// Center of page — large circular SVG progress ring
// Shows "62%" with count-up animation via useCountUp()
// Ring: conic-gradient blue, track light blue, glow filter
// Below ring: AI summary sentence in italic
// ScoreBreakdown accordion — 6 metrics each as labeled ProgressBar
//   Income Stability:    50/100
//   Savings Discipline:  85/100
//   Portfolio Risk:      35/100
//   Spending Discipline: 95/100
//   Wallet Maturity:     40/100
//   Debt/Risk Signals:   90/100
```

**SVG Gauge implementation:**
```tsx
function CircularGauge({ value, max = 100 }: { value: number; max?: number }) {
  const r = 88, cx = 100, cy = 100;
  const circ = 2 * Math.PI * r;
  const dash = (value / max) * circ;
  return (
    <svg viewBox="0 0 200 200" className="w-52 h-52">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-surface-2)" strokeWidth={14}/>
      <circle cx={cx} cy={cy} r={r} fill="none"
        stroke="var(--color-primary)" strokeWidth={14}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 100 100)"
        style={{ filter: "drop-shadow(0 0 8px var(--color-primary-glow))" }}/>
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em"
        className="text-4xl font-extrabold fill-[var(--color-text)]">
        {value}%
      </text>
    </svg>
  );
}
```

**Gauge Arc (for Reputation Score — semicircle inspired by screenshot Image 2):**
```tsx
// Render a 180° semicircle gauge with tick marks (like the orange gauge in Image 2)
// Ticks: 40 evenly spaced dashes around the arc, colored blue below pointer, muted above
// Needle: thin triangle pointing to score position
// Center text: "87" large, below: "/100"
```

### 4.5 LoanCapacityCard

```tsx
// Metric display: "0 USD" in large red text (Ineligible)
// OR if eligible: "$250–$800 USD" range
// Confidence badge: "Medium" — amber/warning color
// Small footnote: derived from monthly inflow $4.06
```

### 4.6 RiskExposureCard

```tsx
// Title: "Portfolio Risk Exposure"
// HIGH RISK badge — red border with pulsing animation (CSS keyframe)
// Stacked horizontal bar showing 4 segments:
//   Stablecoin 10% — blue
//   Volatile    1% — light blue  
//   DeFi        0% — gray
//   NFT        89% — red/danger
// Each segment: hover tooltip with exact %
// Below bar: 4 stat boxes in 2×2 grid with values
```

**Stacked bar:**
```tsx
<div className="flex rounded-full overflow-hidden h-4 w-full">
  <div style={{ width: "10%", background: "var(--color-primary)" }} />
  <div style={{ width: "1%",  background: "var(--color-primary-light)" }} />
  <div style={{ width: "0%",  background: "var(--color-text-faint)" }} />
  <div style={{ width: "89%", background: "var(--color-danger)" }} />
</div>
```

### 4.7 IncomeSummaryCard (Right Column)

```tsx
// Tabbed toggle: [1M] [2M] [6M] [1Y] — blue active pill
// Headline stats row: Inbound | Outbound | Net Cash Flow
// TokenFlowTable — striped rows:
//   Columns: Symbol | Name | Inflow | Outflow | Net | USD Value
//   Rows from mockData.tokens mapped to income data
// "Stable Earner" gold badge at top
```

### 4.8 IncomeStabilityCard

```tsx
// Weekly Consistency: ProgressBar 75% — animated fill
// Monthly Estimate: $4.06 USD (large)
// Average Inflow: $0.06 USD  
// Recurring Patterns: green checkmark "True — Stable recurring patterns detected"
```

### 4.9 GrowthJourneyChart

```tsx
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
// Data: mock monthly portfolio value Jul 2024 → May 2026
// Fill: gradient from var(--color-primary) → transparent
// Stroke: var(--color-primary)
// Custom tooltip: white card with blue border
```

### 4.10 AIAnalysisCard

```tsx
// Blue-tinted surface-2 background
// Quote icon + italic advisory text paragraph
// Two action buttons (full width, stacked):
//   1. [↓ Download Free PDF Summary] — outlined blue button
//   2. [🏅 Get Official Attestation — 0.10 USDT] — solid blue gradient button
//      On click: opens <AttestationModal />
```

### 4.11 AttestationModal

```tsx
// Overlay backdrop blur
// White card, centered
// Report Hash: monospace truncated hash
// Attestation paragraph from mockData.attestation.paragraph
// [Close] and [Copy Hash] buttons
```

### 4.12 ChatSidebar

```tsx
// Right panel, sticky, height: calc(100vh - 4rem)
// Header: "ChainScore AI Chat" + blue dot "Online"
// Micropayment warning banner (amber background):
//   "Questions incur 0.05 USDT (X402 standard)"
// Message list: bubbles — user right (blue), AI left (white with border)
// 3 suggested prompt chips below input
// Input bar with send button
// Initial AI greeting message pre-loaded
```

---

## 5. Animations & Interactions

| Element | Animation |
|---|---|
| Card mount | `fadeUp` stagger via Framer Motion |
| Score numbers | `useCountUp` hook, 1.5s ease-out |
| Gauge arc | SVG `strokeDasharray` CSS transition 1.2s |
| HIGH RISK badge | `@keyframes pulse-border` red glow loop |
| Progress bars | width transition 1s on IntersectionObserver entry |
| Chat messages | slide-in from bottom, opacity fade |
| Tab switch | layout animation via Framer `AnimatePresence` |
| Button hover | `translateY(-2px)` + shadow intensify |

---

## 6. Mock Data (paste into `src/data/mockWallet.ts`)

```ts
export const mockWallet = {
  walletAddress: "0x4821ced48fb4456055c86e42587f61c1f39c6315",
  ens: null,
  walletAgeMonths: 22,
  celoPrice: 0.06087,
  totalTransactions: 48,
  portfolio: {
    stablecoinBalance: 0.5,
    volatileBalance: 0.05,
    defiExposure: 0,
    nftCount: 6,
    nftExposure: 600,
    totalValueUsd: 600.55
  },
  tokens: [
    { symbol: "CELO",  name: "Celo Native Asset",      balance: 0.783,    usdValue: 0.0477, isStable: false },
    { symbol: "USDT",  name: "Tether",                 balance: 0.3599,   usdValue: 0.3599, isStable: true  },
    { symbol: "USDC",  name: "USD Coin",                balance: 0.0281,   usdValue: 0.0281, isStable: true  },
    { symbol: "CUSD",  name: "Celo Dollar",             balance: 0.078,    usdValue: 0.078,  isStable: true  },
    { symbol: "CKES",  name: "Celo Kenyan Shilling",    balance: 4.333,    usdValue: 0.0329, isStable: true  },
    { symbol: "EARN",  name: "Earnbase Token",          balance: 9900000,  usdValue: 0,      isStable: false }
  ],
  incomeByPeriod: {
    "1M":  { inbound: 4.06,  outbound: 3.80,  net: 0.26  },
    "2M":  { inbound: 8.12,  outbound: 7.20,  net: 0.92  },
    "6M":  { inbound: 24.36, outbound: 22.00, net: 2.36  },
    "1Y":  { inbound: 48.72, outbound: 44.00, net: 4.72  }
  },
  tokenFlows: [
    { symbol: "CELO",  name: "Celo Native Asset",      inflow: 14.5,    outflow: 10.2,   net: 4.3,    usd: 0.26  },
    { symbol: "USDT",  name: "Tether",                 inflow: 150.0,   outflow: 120.0,  net: 30.0,   usd: 30.00 },
    { symbol: "USDC",  name: "USD Coin",                inflow: 0.0,     outflow: 0.0,    net: 0.0,    usd: 0.00  },
    { symbol: "CUSD",  name: "Celo Dollar",             inflow: 20.0,    outflow: 10.0,   net: 10.0,   usd: 10.00 },
    { symbol: "CKES",  name: "Celo Kenyan Shilling",    inflow: 50.0,    outflow: 0.0,    net: 50.0,   usd: 0.38  },
    { symbol: "EARN",  name: "Earnbase Token",          inflow: 9900000, outflow: 0,      net: 9900000,usd: 0.00  }
  ],
  growthHistory: [
    { month: "Jul 24", value: 12 },  { month: "Aug 24", value: 18 },
    { month: "Sep 24", value: 15 },  { month: "Oct 24", value: 22 },
    { month: "Nov 24", value: 19 },  { month: "Dec 24", value: 25 },
    { month: "Jan 25", value: 30 },  { month: "Feb 25", value: 28 },
    { month: "Mar 25", value: 35 },  { month: "Apr 25", value: 32 },
    { month: "May 25", value: 40 },  { month: "Jun 25", value: 38 },
    { month: "Jul 25", value: 45 },  { month: "Aug 25", value: 550 },
    { month: "Sep 25", value: 560 }, { month: "Oct 25", value: 575 },
    { month: "Nov 25", value: 570 }, { month: "Dec 25", value: 590 },
    { month: "Jan 26", value: 595 }, { month: "Feb 26", value: 598 },
    { month: "Mar 26", value: 600 }, { month: "Apr 26", value: 600 },
    { month: "May 26", value: 600.55 }
  ],
  firstTransaction: {
    hash: "0xd4752aa1fde1f9584ab802a000b94ecde313a38044b3978ae45bd5a85de94bd3",
    timestamp: "2024-07-15T05:50:08.000Z",
    token: "CELO"
  },
  lastTransaction: {
    hash: "0xaa647c82e0cc8f43f639672c58b5f246219bdb28b27ac793e8e87181f959d073",
    timestamp: "2026-05-29T18:56:57.000Z",
    token: "CELO"
  },
  metrics: {
    financialHealth: {
      score: 62,
      breakdown: {
        incomeStability:    50,
        savingsDiscipline:  85,
        portfolioRisk:      35,
        spendingDiscipline: 95,
        walletMaturity:     40,
        debtRiskSignals:    90
      }
    },
    reputation: {
      score: 87,
      category: "Established Wallet",
      rationale: "This wallet demonstrates long-term legitimate activity across trusted protocols. Age of 22 months and interaction with multiple smart contracts indicates solid standing."
    },
    risk: {
      category: "High",
      allocation: { stablecoin: 10, volatile: 1, defi: 0, nft: 89 }
    },
    incomeProfile: {
      label: "Stable Earner",
      monthlyEstimateUsd: 4.06,
      weeklyConsistency: 75,
      averageInflowUsd: 0.06,
      recurringSenderPatterns: true
    },
    loanCapacity: {
      range: "0 USD (Ineligible)",
      minLoanUsd: 0,
      maxLoanUsd: 0,
      confidence: "Medium"
    }
  },
  attestation: {
    hash: "0x7a30ef182a4729cb251d8b92fd2381f9c8fcd918374d89b1c7a8efb472e3914a",
    paragraph: "This document serves as an official financial attestation generated by ChainScore AI. Wallet address 0x4821ced48fb4456055c86e42587f61c1f39c6315 shows a weighted Financial Health Index of 62% and a Trust Reputation Score of 87/100. The estimated borrowing capacity is certified within the range of 0 USD (Ineligible)."
  }
};
```

---

## 7. Tailwind Config

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sora: ["Sora", "sans-serif"],
        sans: ["DM Sans", "sans-serif"],
      },
      colors: {
        primary: "#1A56FF",
        "primary-dark": "#1240CC",
        "primary-light": "#5B8AFF",
        surface: "#FFFFFF",
        "surface-2": "#EBF2FF",
        border: "#D0DEFF",
        muted: "#5B6E9A",
        success: "#0FB27A",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      borderRadius: { "2xl": "16px", "3xl": "24px" },
      boxShadow: {
        card: "0 2px 16px rgba(26,86,255,0.08)",
        "card-hover": "0 8px 32px rgba(26,86,255,0.18)",
        glow: "0 0 20px rgba(26,86,255,0.25)",
      },
    },
  },
  plugins: [],
} satisfies Config;
```

---

## 8. useCountUp Hook

```ts
// src/hooks/useCountUp.ts
import { useEffect, useRef, useState } from "react";
export function useCountUp(target: number, duration = 1500) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>();
  useEffect(() => {
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setValue(Math.round(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current!);
  }, [target, duration]);
  return value;
}
```

---

## 9. Key UX Patterns (from reference screenshot)

Inspired by the CRM dashboard screenshot provided:

| CRM Pattern | ChainScore Adaptation |
|---|---|
| Blue hero banner with trophy | Blue gradient hero card with shield/score icon |
| Progress ring (55%) | FinancialHealthGauge (62%) + ReputationGauge (87%) |
| Task list cards | Token flow table rows |
| Stacked bar chart (followers) | Portfolio risk stacked bar |
| Dual-line area chart | Growth journey area chart |
| Stats row (4800 views, 2.5s, 3404) | Income stats (inbound / outbound / net) |

Semicircle gauge (Image 2 — tick mark style):
- 40 tick marks around 180° arc
- Ticks to the left of needle: `var(--color-primary)` 
- Ticks to the right: `var(--color-border)`
- Needle: thin SVG path pointing to score position
- Center: large score number + "/100" subtext

---

## 10. Agent Instructions

When using this spec to build the dashboard:

1. **Start with** `globals.css` (CSS variables) and `tailwind.config.ts`.
2. **Build UI primitives first**: `Card`, `Badge`, `ProgressBar`, `GaugeArc` in `src/components/ui/`.
3. **Build layout**: `Header`, then the 3-column grid in `page.tsx`.
4. **Populate with mock data** from `src/data/mockWallet.ts` — no API calls needed.
5. **Add animations last** with Framer Motion — don't block rendering.
6. **Test responsiveness** at 768px and 1280px breakpoints.
7. All monetary values must use `toFixed(2)`.
8. All wallet addresses must truncate: first 6 + "..." + last 4 chars.
9. Timestamps must format as `DD MMM YYYY HH:mm UTC`.
10. NFT exposure at 89% must always trigger the `HIGH RISK` pulsing badge.

---

*Generated by Claude — ChainScore AI Dashboard Spec v1.0*
