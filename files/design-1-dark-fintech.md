# Design 1 — "Dark Fintech Terminal"
> Evolution of the current chainscore.html design. Inspired by Bloomberg terminal aesthetics meets Web3.

---

## Visual Identity

| Token | Value |
|---|---|
| **Primary bg** | `#080c1a` (deep navy) |
| **Surface** | `#0d1428` |
| **Accent 1** | `#f5a623` (amber/gold) |
| **Accent 2** | `#00d4aa` (teal) |
| **Text** | `#f0f2f8` / `#8a93b2` muted |
| **Font — Display** | Syne 800 |
| **Font — Body** | DM Sans 300/400 |
| **Font — Mono** | DM Mono (scores, labels, addresses) |
| **Border style** | `0.5px solid rgba(245,166,35,0.15)` |
| **Radius** | `6px` cards, `4px` buttons |

---

## Hero Section Layout

**Pattern:** Full-width split — left text + right interactive panel.
Inspired by Jot's hero (bold headline left, real content right), but dark-themed.

```
┌──────────────────────────────────────────────────────────────┐
│  NAV: logo [dot pulse] ··· links ··· [Connect Wallet CTA]   │
├─────────────────────────┬────────────────────────────────────┤
│                         │                                    │
│  [ERC-8004 badge]       │  ┌──── WALLET INPUT CARD ────┐    │
│                         │  │ 🔗 Enter wallet address    │    │
│  Your Wallet Is Your    │  │ ┌──────────────────────┐   │    │
│  Financial              │  │ │ 0x4f3a...b82c        │   │    │
│  Reputation.            │  │ └──────────────────────┘   │    │
│                         │  │   [Analyze Wallet →]        │    │
│  Subheadline text here  │  └────────────────────────────┘    │
│  about bridging Web3    │                                    │
│  and traditional        │  ── ANALYZING ── (animated)        │
│  finance.               │                                    │
│                         │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ │
│  [Get Your Score →]     │  │  87 │ │  91 │ │ 78% │ │$2.4k│ │
│  [Learn More]           │  │Hlth │ │Rep. │ │Inc. │ │Loan │ │
│                         │  └─────┘ └─────┘ └─────┘ └─────┘ │
│                         │                                    │
└─────────────────────────┴────────────────────────────────────┘
```

### Hero Animation Flow (Next.js framer-motion)
1. Page load → left text fades in with `staggerChildren` (0.1s delay each word group)
2. Right panel slides in from right (`x: 60 → 0`, `opacity: 0 → 1`)
3. Wallet input card appears first — idle state, cursor blinking in input
4. On wallet address entry → trigger "analyzing" shimmer animation across the card
5. Score cards reveal one by one with `staggerChildren` (amber counter animates 0 → final value)
6. Subtle amber glow radiates behind score cards on reveal

### Hero Right Panel — Component Detail

```tsx
// WalletInputPanel.tsx
<div className="wallet-panel">
  {/* Step 1: Input */}
  <div className="input-card">
    <label>Enter wallet address</label>
    <input placeholder="0x..." className="mono" />
    <button>Analyze Wallet →</button>
  </div>

  {/* Step 2: Loading (conditional) */}
  <AnalyzingAnimation />   {/* pulsing skeleton rows */}

  {/* Step 3: Results (conditional) */}
  <div className="scores-grid">
    <ScoreCard label="Financial Health" value={87} color="amber" />
    <ScoreCard label="Reputation Score" value={91} color="amber" />
    <ScoreCard label="Income Stability" value="78%" color="teal" />
    <ScoreCard label="Loan Capacity"    value="$2,400–$4,800" color="white" />
  </div>
</div>
```

---

## Other Sections

### Problem (below fold)
- Two-column: bullet pain points (left) + three stat boxes stacked (right)
- Stats: `3B+ unbanked`, `$180B crypto income`, `0.1 USDT report`
- Each stat box has a bottom colored line (amber or teal)

### How It Works
- 4-column step cards with hover animation (`scaleX` top border reveal)
- Connected by a faint dashed line between step icons

### Features
- Left: clickable accordion list of features
- Right: live report preview mockup (scores, bars, loan range)
- Active feature highlights in amber

### Who It's For
- 3×2 card grid, each with emoji icon, title, description
- Hover lifts card and reveals amber top border

### OnFRA Agent
- Centered section, teal glow radial in background
- Pill-tag list of capabilities

### CTA
- Full-width section with amber top border glow
- Price badge: `0.1 USDT · Full Verified Report`

---

## Next.js Implementation Notes

```
/app
  /page.tsx              ← assembles all sections
  /components
    /hero
      HeroSection.tsx
      WalletInputPanel.tsx
      ScoreCard.tsx
      AnalyzingAnimation.tsx
    /sections
      ProblemSection.tsx
      HowItWorks.tsx
      FeaturesSection.tsx
      UsersSection.tsx
      OnfraSection.tsx
      CtaSection.tsx
    /ui
      Button.tsx
      SectionLabel.tsx
      ReportPreview.tsx
```

### Key Libraries
- `framer-motion` — hero animations, score counter, stagger reveals
- `tailwindcss` — utility classes (extend with custom colors above)
- `wagmi` + `viem` — real wallet connection (ConnectButton)
- `@tanstack/react-query` — wallet analysis API calls
- `react-countup` — animated score counters

### Tailwind Config Extensions
```js
// tailwind.config.js
colors: {
  navy: { DEFAULT: '#080c1a', 2: '#0d1428', 3: '#141e38', 4: '#1c2a4a' },
  amber: { DEFAULT: '#f5a623', light: '#ffc85c', dim: '#a06c0f' },
  teal:  { DEFAULT: '#00d4aa', dim: '#007a62' },
}
```

---

## Mood
**Bloomberg Terminal × Coinbase × Linear** — serious financial tool that happens to live onchain. Premium, data-dense, trustworthy. The amber gold signals value; teal signals technology and growth. Every number feels real.
