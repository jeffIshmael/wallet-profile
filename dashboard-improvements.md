# ChainScore Dashboard — Improvement Brief
> Feed this entire file to your AI agent. It contains a full audit of the current dashboard at `localhost:3000/dashboard` and precise instructions for every improvement needed.

---

## Current State Audit

The dashboard is functional and data-rich. The core layout (sidebar + top nav + card grid) is solid. The following improvements will elevate it from a working prototype to a production-quality financial product.

---

## 1. Navigation & Header

### Current issues
- Top-right wallet address (`0x4821...6315`) and CELO price badge feel disconnected — different weights and sizes with no clear visual grouping
- The three action buttons ("Get Full Report", "See Sample Report", "ChainScore AI") are inside the **Wallet Summary card** instead of the persistent top bar — they get lost when scrolling
- Sidebar has only two icon buttons with no labels or tooltips
- No breadcrumb or page title context

### Fixes

**Move action buttons to the top navigation bar** — they are global actions, not card-specific. Place them right-aligned in the nav, grouped with a visual separator from the wallet address pill.

```
┌────────────────────────────────────────────────────────────────────┐
│  ChainScore logo  │  [Dashboard]  [Reports]  [History]            │
│                   │                    [⬇ Get Report 0.1 USDT]    │
│                   │          [0x4821...6315 ↗]  [CELO $0.061] ⚙  │
└────────────────────────────────────────────────────────────────────┘
```

**Sidebar improvements:**
- Add tooltip labels on hover for each icon
- Add a subtle active state (amber left border + icon color change)
- Add a collapse/expand toggle at the bottom
- Consider adding: Dashboard, Reports, History, Settings icons

---

## 2. Wallet Summary Card

### Current issues
- The card spans full width but the data inside is left-aligned with no visual hierarchy — all 6 metadata fields (`Wallet Address`, `ENS Name`, `Wallet Age`, `Total Txns`, `First Tx`, `Last Tx`) are the same weight and size
- "None registered" for ENS is shown with no visual treatment — it just looks like missing data
- The wallet avatar (top-left black square with "IBL") appears to be a placeholder with no clear purpose
- No clear separation between the wallet identity section and the transaction metadata

### Fixes

**Add visual hierarchy to the metadata fields:**
```
Label (10px, uppercase, muted color, DM Mono)
Value (14px, semibold, white)
```

**Group the 6 fields into two logical clusters:**
- Left cluster: Identity (Address, ENS Name, Wallet Age)
- Right cluster: Activity (Total Txns, First Tx, Last Tx)

**ENS "None registered" state:** render as a muted pill badge with a `+` icon linking to an ENS registration guide, rather than plain grey text.

**Replace the placeholder avatar** with a deterministic wallet identity icon (e.g., a gradient circle generated from the wallet address hash — similar to ENS avatars or Metamask's Jazzicons).

**Add a wallet health summary line** below the address — a single sentence from the AI (e.g., *"Active for 2.4 years · 312 transactions · Last active 10 days ago"*) as a quick human-readable summary.

---

## 3. Score Cards Grid (Financial Health, Income Stability, Wallet Reputation)

### Current issues
- **Financial Health** uses a circular progress ring — good, but the ring is very thick and the percentage label inside is large, leaving no room for context
- **Income Stability** and **Wallet Reputation** use different visual treatments (number + badge vs ring) — inconsistency makes the grid feel undesigned
- The badge labels ("Stable Earner", "Highly Trusted") are styled differently between cards
- Card backgrounds are all the same flat dark color — no visual differentiation

### Fixes

**Standardize all three score cards** with a consistent component:

```tsx
interface ScoreCardProps {
  title: string
  score: number        // e.g. 89
  maxScore: number     // e.g. 100
  badge: string        // e.g. "Excellent Financial Health"
  badgeVariant: 'green' | 'amber' | 'red'
  description?: string
  icon?: ReactNode
}
```

**Layout per card:**
```
┌─────────────────────────────────────┐
│  Title                          [?] │
│                                     │
│  [Thin ring/arc, 120px]             │
│       89%                           │
│  [Badge: Excellent · green]         │
│                                     │
│  Short descriptor text              │
└─────────────────────────────────────┘
```

- Use a **thinner arc** (stroke-width 6–8px vs current ~14px) — more elegant, data visualization style
- Show the badge consistently below the ring in all three cards
- Add a `description` line below the badge (currently only Wallet Reputation has this)
- Use **subtle card background tinting** based on score range:
  - Score ≥ 80: very faint green tint (`rgba(34, 211, 164, 0.04)`)
  - Score 50–79: very faint amber tint
  - Score < 50: very faint red tint

---

## 4. Loan Capacity & Avg Monthly Income Cards

### Current issues
- **Loan Capacity** card is mostly empty — shows range and one subtitle line, but 60% of the card is blank space
- **Avg Monthly Income** is similarly sparse — just `$1250.00` and a label
- No trend indicators, no context for what these numbers mean relative to the wallet's history
- The amber color on the loan range (`$1,800 - $2,400`) is correct but the range itself could use a visual representation

### Fixes

**Loan Capacity card — add:**
- A horizontal range bar showing the capacity as a range within a possible min/max scale
- A breakdown row: *"Based on: Income consistency (87%) · Reputation (92%) · Risk profile (Medium)"*
- A "How is this calculated?" expandable tooltip

```
$1,800 ──────[████████████████░░░░]── $2,400
              min recommended      max recommended
```

**Avg Monthly Income card — add:**
- A mini sparkline (last 6 months) inside the card — just a small 80×30px SVG line chart
- A month-over-month change badge: `+12% vs last month` in green or `−5%` in red
- Secondary stat: *"Highest month: $1,840 · Lowest: $620"*

---

## 5. Portfolio Risk Card

### Current issues
- The horizontal bars for Stablecoins, Volatile Assets, DeFi Exposure, NFT Exposure are good in concept but the bars are all the same blue color — no differentiation
- "Medium Risk" badge in amber is correct but sits in the card header with no visual weight
- No explanation of what each category means or why it matters for lending

### Fixes

**Color-code each bar by risk level:**
| Category | Color |
|---|---|
| Stablecoins | `#22d3a4` teal (low risk) |
| Volatile Assets | `#f5a623` amber (medium risk) |
| DeFi Exposure | `#f59e0b` orange-amber (medium-high) |
| NFT Exposure | `#ef4444` soft red (high risk) |

**Add a donut chart** (small, 80px) in the top-right of the card showing the same breakdown visually — gives instant spatial understanding.

**Add a risk score bar** below the title:
```
Risk Level:  Low ──[████████░░░░░░]── High
                        Medium Risk
```

**Add tooltips** on each category label explaining what it means for lending decisions.

---

## 6. Financial Growth Chart

### Current issues
- The chart is very plain — a single line with no area fill, no axis labels on Y, no data points/hover states
- The token filter (All / USDC / USDT / cUSD / USDm) tabs are small and low contrast
- `$6,000 +0.0%` — the `+0.0%` suggests a calculation issue (likely comparing to itself); this needs a valid time-range comparison
- No period selector (1M / 3M / 6M / 1Y / All)
- Chart takes up a lot of vertical space but the line only occupies the bottom third

### Fixes

**Add area fill** below the line with a gradient: `rgba(0, 212, 170, 0.15)` → `transparent`. This is standard in financial dashboards and makes the chart feel alive.

**Add period selector buttons** aligned right: `1M · 3M · 6M · 1Y · All`

**Fix Y-axis labels** — currently invisible. Show 3–4 reference lines with dollar values.

**Add hover tooltip** on data points showing: date, total value, month-over-month change.

**Fix `+0.0%` badge** — compute against the selected period's start value.

**Resize the chart:** reduce height from ~200px to ~160px — the line uses very little of the current space.

---

## 7. AI Summary Card

### Current issues
- The 2×3 bullet grid (6 green checkmark items) is good but all items look identical — no hierarchy, no way to tell what's most important
- No action items — just observations. A user can't do anything with this information
- The card title "AI Summary" is generic

### Fixes

**Rename to "OnFRA Assessment"** — ties it to the branded agent.

**Add a one-paragraph narrative** at the top before the bullets:
```
"This wallet demonstrates strong financial discipline over 2.4 years of 
consistent activity. Income inflows are stable and predictable, 
stablecoin exposure is high (positive signal for lenders), and 
transaction history shows no high-risk behavior. Recommended for 
moderate credit products."
```

**Group bullets into two categories:**
- ✅ Strengths (green) — things working in the user's favor
- ⚠️ Watch items (amber) — neutral or areas to improve (e.g., "No ENS name registered")

**Add a CTA at the bottom of the card:**
```
[Download Full AI Report →]  ← links to report purchase
```

---

## 8. Global Design System Fixes

These apply across the entire dashboard.

### Typography
- Introduce **DM Mono** for all numeric values (scores, amounts, addresses) — monospaced numbers prevent layout shift and look more professional in a financial context
- Use **3 font sizes max:** 12px (labels), 14px (body), 24–32px (hero numbers)
- All section titles: 13px, uppercase, letter-spacing 0.08em, muted color — consistent across every card

### Card Design
- **Reduce card padding** from apparent ~24px to 20px — tighter, more information-dense
- **Add a subtle inner border highlight** on the top edge of cards: `border-top: 1px solid rgba(255,255,255,0.06)` — adds depth without noise
- **Standardize card header layout**: Title left, `[?]` info icon right — consistent on every card (some cards have this, some don't)
- **Card hover state**: very subtle `box-shadow: 0 0 0 1px rgba(245,166,35,0.12)` on hover — indicates interactivity

### Color Usage
- Amber (`#f5a623`) — scores, CTAs, highlighted values only. Currently slightly overused.
- Teal (`#00d4aa`) — positive signals, growth, success states
- Red (`#ef4444`) — risk, negative change only
- White-muted (`#8a93b2`) — labels, secondary text
- Keep the dark background as-is — it's working well

### Empty / Loading States
- Add skeleton loaders for all cards (pulsing dark shapes) for the period between wallet connection and data load
- Add an empty state for ENS: small icon + "Register ENS to improve your reputation score"

### Responsiveness
- The current 3-column grid likely breaks on tablet. Add a responsive grid:
  ```css
  grid-template-columns: repeat(3, 1fr);       /* desktop */
  grid-template-columns: repeat(2, 1fr);       /* tablet <1024px */
  grid-template-columns: 1fr;                  /* mobile <640px */
  ```

---

## 9. New Card to Add — Cash Flow (Inflows vs Outflows)

Currently missing from the dashboard but critical for lending decisions. Add a new card between "Avg Monthly Income" and "Portfolio Risk":

```
┌─────────────────────────────────────┐
│  Cash Flow                      [?] │
│                                     │
│  ↑ Inflows    $8,400 / 6mo          │
│  ↓ Outflows   $6,200 / 6mo          │
│  ── Net       $2,200 surplus ✓      │
│                                     │
│  [bar pair chart — in vs out monthly│
│   for last 6 months]                │
└─────────────────────────────────────┘
```

---

## 10. Priority Order for Implementation

Implement in this order — highest impact first:

| Priority | Change | Effort |
|---|---|---|
| 1 | Fix Financial Growth chart (area fill, Y-axis, hover) | Low |
| 2 | Standardize the 3 score cards (consistent layout) | Medium |
| 3 | Move action buttons to top nav bar | Low |
| 4 | Loan Capacity range bar + breakdown | Low |
| 5 | Portfolio Risk card color-coded bars | Low |
| 6 | Avg Monthly Income sparkline + change % | Medium |
| 7 | AI Summary → OnFRA Assessment redesign | Low |
| 8 | Add Cash Flow card | Medium |
| 9 | Wallet Summary hierarchy + ENS state | Low |
| 10 | Global typography + card system polish | Medium |
| 11 | Skeleton loading states | Medium |
| 12 | Responsive grid | Low |
