# Design 2 — "Light Editorial"
> Inspired directly by UpOrder's clean, white-canvas editorial style with a "before/after" reveal mechanic adapted for ChainScore's wallet-to-score flow.

---

## Visual Identity

| Token | Value |
|---|---|
| **Primary bg** | `#f9f8f5` (warm off-white) |
| **Surface** | `#ffffff` |
| **Surface alt** | `#f2f0eb` |
| **Accent 1** | `#1a3a5c` (deep navy — authority) |
| **Accent 2** | `#2ec99e` (fresh teal — success/growth) |
| **Accent 3** | `#e8a020` (warm gold — scores/value) |
| **Text** | `#111111` / `#666666` muted |
| **Font — Display** | Fraunces (serif, expressive — like a financial broadsheet) |
| **Font — Body** | Plus Jakarta Sans 400/500 |
| **Font — Mono** | JetBrains Mono (addresses, scores) |
| **Border style** | `1px solid #e8e5de` |
| **Radius** | `12px` cards, `8px` buttons, `999px` pills |

---

## Hero Section Layout

**Pattern:** Light background, left-heavy headline, right side shows a two-state mockup — "raw wallet" on the left of the panel and "ChainScore results" on the right. Directly mirrors UpOrder's before/after mechanic.

```
┌──────────────────────────────────────────────────────────────┐
│  NAV: [ChainScore logo] ··· links ···  [Log In] [Get Score] │
├─────────────────────────────────────────────────────────────-┤
│                                                              │
│  [Celo Ecosystem · AI-Powered badge]                        │
│                                                              │
│  Proof of income                    ┌──── HERO PANEL ──────┐ │
│  for the onchain                    │                       │ │
│  economy.                           │  BEFORE   →   AFTER  │ │
│                                     │  ┌──────┐   ┌──────┐ │ │
│  Your wallet has a story.           │  │ Raw  │   │  87  │ │ │
│  ChainScore makes lenders           │  │ txns │   │ hlth │ │ │
│  listen.                            │  │      │   │  91  │ │ │
│                                     │  │ 0x.. │   │ rep. │ │ │
│  [wallet input field] [Analyze →]  │  │      │   │ 78%  │ │ │
│                                     │  │      │   │ inc. │ │ │
│  Don't have a wallet?               │  └──────┘   └──────┘ │ │
│  Learn how ChainScore works         │                       │ │
│                                     └───────────────────────┘ │
├──────────────────────────────────────────────────────────────┤
│  Trusted by:  [Celo] [Partner Saccos] [DeFi Protocols] ...  │
└──────────────────────────────────────────────────────────────┘
```

### Hero Panel — "Raw → Analyzed" Animation

The right panel uses a horizontal split with a drag-able divider (like image comparison sliders), but auto-plays on load:

**Left half (Before):** Shows a messy, unreadable representation of raw wallet data
```
0x4f3a...b82c
────────────────
↓ 0.5 CELO
↑ 124 cUSD
↓ 0.001 CELO
↑ 50 cUSD
↑ 75 cUSD
... 47 more txns
```

**Right half (After):** Polished score dashboard
```
┌─────────────────────────┐
│  Financial Health   87  │  ████████░ amber bar
│  Reputation Score   91  │  █████████ amber bar
│  Income Stability  78%  │  ███████░░ teal bar
│  Loan Capacity $2,400+  │  ← teal badge
└─────────────────────────┘
```

**Interaction:** divider auto-slides from left to right on page load (2s), then stops at center. User can drag it. This is the "wow" moment.

### Hero Wallet Input (below headline, inline)
```tsx
// Inspired by UpOrder's store-name input
<div className="hero-input-row">
  <div className="input-wrapper">
    <span className="prefix-icon">🔗</span>
    <input placeholder="0x wallet address..." className="mono" />
  </div>
  <button className="cta-btn">Analyze for Free →</button>
</div>
<p className="hint">Premium report: 0.1 USDT · <a>See what's included</a></p>
```

---

## Color & Mood System

The page alternates between:
- `bg-warm-white` sections (default) — hero, features
- `bg-navy` sections (contrast) — OnFRA agent, CTA
- `bg-teal-faint` sections (data-friendly) — stats, how it works

This rhythm is pulled directly from Jot's section alternation pattern.

---

## Other Sections

### Social Proof Bar (below hero fold)
Horizontally scrolling logo strip on `#f2f0eb` background — partner Saccos, microfinance institutions, DeFi protocols. Text: *"Accepted by financial institutions across East Africa and Web3"*

### Problem — Two Column
- Left: serif headline `"Your wallet has 3 years of financial history. Banks can't read it."`
- Right: two comparison cards — "What banks see" (empty/crossed out items) vs "What ChainScore sees" (rich data list)

### How It Works — Horizontal Timeline
- 4 steps laid out horizontally with connecting arrows
- Each step has a numbered circle, title, and short description
- Below each: a small UI snippet (wallet icon → brain icon → chart icon → document icon)

### Report Preview — Full Section
- Light section, headline centered
- Large mockup of the Financial Reputation Report PDF layout
- Floating labels pointing to different sections: "AI-generated assessment", "Loan capacity", "Income trend graph"
- Download sample button

### Features — 3-col Cards on off-white
- Each feature in its own card with a navy icon circle, title, description
- Hover: card lifts, teal left border appears

### Users — Tabbed Interface
- Left: vertical tab list (Freelancers, Remote Workers, Creators, etc.)
- Right: description + relevant wallet scenario example for each

### CTA — Navy Background Section
- White text on navy, inspired by Jot's teal CTA
- Wallet input repeated here
- Price callout in gold

---

## Next.js Component Structure

```
/app
  /page.tsx
  /components
    /hero
      HeroSection.tsx
      WalletBeforeAfter.tsx    ← drag-slider component
      WalletInputBar.tsx
    /sections
      SocialProofBar.tsx
      ProblemSection.tsx
      HowItWorksTimeline.tsx
      ReportPreviewSection.tsx
      FeaturesGrid.tsx
      UsersTabs.tsx
      CtaSection.tsx
    /ui
      ComparisonSlider.tsx     ← the before/after divider
      ScoreBar.tsx
      Button.tsx
```

### Key Libraries
- `framer-motion` — slider animation, section reveals on scroll
- `react-compare-slider` or custom CSS clip-path for before/after panel
- `@radix-ui/react-tabs` — users section tabbed interface
- `tailwindcss` + `@tailwindcss/typography` for prose sections
- `wagmi` for wallet connection

### Tailwind Config
```js
colors: {
  cream:  { DEFAULT: '#f9f8f5', alt: '#f2f0eb' },
  navy:   { DEFAULT: '#1a3a5c', light: '#2a5080' },
  teal:   { DEFAULT: '#2ec99e', faint: '#e8f9f5' },
  gold:   { DEFAULT: '#e8a020', faint: '#fdf3e0' },
}
fontFamily: {
  display: ['Fraunces', 'serif'],
  body:    ['Plus Jakarta Sans', 'sans-serif'],
  mono:    ['JetBrains Mono', 'monospace'],
}
```

---

## Mood
**Financial Times × Stripe × UpOrder** — credible, editorial, grown-up. The serif headlines give it the gravitas of a serious financial institution. The teal and gold keep it warm and approachable. Light backgrounds let the data breathe. The before/after mechanic is the central storytelling device — you instantly *see* what ChainScore does.
