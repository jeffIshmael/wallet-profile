# ChainScore — Transaction Statements Page Improvement Brief
> `/dashboard/statements` — Full audit and precise implementation instructions for your AI agent.

---

## Current State Audit

The page has the right bones: a period selector, three summary stat cards, and a transactions table. However it suffers from three core problems:

1. **The page is nearly empty** — 6 rows of transactions with ~400px of blank space below. No pagination UI, no empty state, no indication of how many total transactions exist.
2. **The summary stat cards are severely underdeveloped** — each is just a large number and a period badge. No trend, no context, no chart.
3. **The transaction table is missing critical columns and interactions** — no search, no filter, no sort, no pagination, no row expansion.

---

## Section 1: Page Header

### Current issues
- Title "Transaction Statements" is plain and sits alone with just a `[?]` icon
- The period selector (1M / 3M / 6M / 12M) is the only control on the page — no export, no filter, no search

### Fixes

**Redesign the header row into two lines:**

```
Line 1:  Transaction Statements          [Export CSV ↓]  [Export PDF ↓]
Line 2:  [1M]  [3M●]  [6M]  [12M]       [🔍 Search txns...]  [Filter ▾]  [Token ▾]
```

- `Export CSV` and `Export PDF` buttons — right-aligned, ghost style
- Search input: filters the table in real-time by amount, counterparty address, token, or hash
- `Filter` dropdown: Direction (All / Incoming / Outgoing), Token (All / USDT / USDC / CUSD / CELO), Amount range
- `Token` dropdown shortcut for the most common filter

---

## Section 2: Summary Stat Cards (Total Inflow / Total Outflow / Net Flow)

### Current issues
- Each card shows one number and a period badge — nothing else
- The three cards are visually identical (same size, same layout, same background) with no color differentiation to signal meaning
- Net Flow `+$1710.00` is positive but looks the same as if it were negative — no color signal
- The `3M` period badge inside each card is redundant — the period is already selected in the global tabs above
- No trend comparison — is $3,750 inflow good? Better than last period? Worse?

### Fixes

**Add color differentiation:**
- Total Inflow card: subtle teal left border or top accent (`#00d4aa`)
- Total Outflow card: subtle amber left border (`#f5a623`)
- Net Flow card: dynamic — teal when positive, red when negative

**Add a mini bar chart inside each card** — last 4 periods (e.g., for 3M view: show Dec, Jan, Feb, Mar as 4 bars):

```
┌──────────────────────────────────────┐
│  TOTAL INFLOW                        │
│  $3,750.00                           │
│  ▲ +18% vs previous 3M              │  ← teal if up, red if down
│                                      │
│  ▁▃▅█  (4-bar sparkbar, last 4 periods)│
└──────────────────────────────────────┘
```

**Remove the `3M` badge inside each card** — it's redundant with the global period selector.

**Net Flow card specifics:**
- Color the value dynamically: `text-teal-400` when positive, `text-red-400` when negative
- Add a savings rate line: *"45.6% savings rate"* (Net / Inflow × 100) — this is a key lending signal

```tsx
// Net flow card bottom line
const savingsRate = ((netFlow / totalInflow) * 100).toFixed(1)
// renders: "45.6% savings rate  ●  Healthy"
```

---

## Section 3: Add a Cash Flow Chart (New — currently missing)

Between the stat cards and the transactions table, add a **Cash Flow bar chart**:

```
┌─────────────────────────────────────────────────────────────────┐
│  Cash Flow Overview                           [Inflow] [Outflow]│
│                                                                  │
│  $2000 ┤                                                         │
│  $1500 ┤     ██                    ██                           │
│  $1000 ┤  ██ ██  ░░            ██  ██                           │
│   $500 ┤  ██ ██  ░░  ░░  ░░   ██  ██  ░░                       │
│        └──────────────────────────────────────────────          │
│          Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep            │
│                                                                  │
│  ── Teal bars = Inflow   ░░ Amber bars = Outflow                │
└─────────────────────────────────────────────────────────────────┘
```

- Use `recharts` `BarChart` with two `Bar` components (inflow teal, outflow amber)
- Responds to the period selector — updates to show monthly bars for the selected range
- Hover tooltip: `"March 2026 · Inflow $1,420 · Outflow $890 · Net +$530"`
- Show average inflow line as a thin dashed horizontal reference line

---

## Section 4: Transactions Table

### Current issues
- Only **6 rows visible** with no pagination controls shown — unclear if there are more transactions
- **No row hover state** — rows don't react to mouse at all
- **No sorting** — can't click column headers to sort by amount or date
- **No search or filter** — must scroll through all transactions to find one
- **DIRECTION column** uses color badges (green Incoming, red Outgoing) — good, but the row itself has no directional color signal
- **COUNTERPARTY column** just shows a truncated address with no copy button (copy button is only on the HASH column)
- **AMOUNT column** doesn't show color — `$420.00` incoming looks the same as `$180.00` outgoing
- **TOKEN column** shows just text — no token icon/logo
- The **HASH column** has copy + external link icons — this is correct, keep it

### Fixes

**Table row redesign:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TIMESTAMP       TOKEN    AMOUNT        DIRECTION   COUNTERPARTY    HASH    │
├─────────────────────────────────────────────────────────────────────────────┤
│ ▌ 28 May 2026   [USDT]   +$420.00 ↑   Incoming    0x7a3f...9c12   0xaa6.. │
│   14:22 UTC               (teal)                   [copy]          [copy↗] │
├─────────────────────────────────────────────────────────────────────────────┤
│ ▌ 26 May 2026   [USDC]   −$180.00 ↓   Outgoing    0x2b91...4e88   0xd47.. │
│   09:15 UTC               (amber)                  [copy]          [copy↗] │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Specific column improvements:**

| Column | Change |
|---|---|
| Left edge | Add a 3px colored left border per row: teal = incoming, amber = outgoing |
| TIMESTAMP | Show date and time on two lines (date bold, time muted) |
| TOKEN | Add a small token icon circle (colored by token) before the name |
| AMOUNT | Color-code: `+$420.00` in teal for incoming, `−$180.00` in amber for outgoing. Add +/− prefix and arrow |
| DIRECTION | Keep badge but make it consistent width (`min-w-[90px] text-center`) so the table doesn't wobble |
| COUNTERPARTY | Add copy icon (matching the HASH column). On hover, show "View on Celoscan" tooltip |
| HASH | Keep as-is — copy + external link is correct |

**Add row hover state:**
```css
tr:hover {
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
}
```

**Add row expansion** — clicking a row expands it to show:
```
  ▼ expanded row
  ┌────────────────────────────────────────────────────────┐
  │  Full Hash:      0xaa64...d073  [copy] [view on scan]  │
  │  Full Address:   0x7a3f...9c12  [copy] [view on scan]  │
  │  Block Number:   28,431,220                            │
  │  Gas Fee:        0.00012 CELO ($0.000007)              │
  │  Network:        Celo Mainnet                          │
  └────────────────────────────────────────────────────────┘
```

**Add sortable column headers:**
- Clickable: TIMESTAMP (default desc), AMOUNT (asc/desc), TOKEN
- Show sort indicator: `↓` / `↑` on active column
- Header row styling: `uppercase, 11px, letter-spacing 0.1em, muted color` — matches the dashboard card label style

**Add pagination:**
```
[← Prev]  Page 1 of 8  (showing 10 of 76 transactions)  [Next →]
          [10 per page ▾]
```

- Default 10 rows per page
- Page size selector: 10 / 25 / 50
- Show total count: "76 transactions"

**Add an empty state** (for wallets with no transactions in the selected period):
```
┌──────────────────────────────────────────┐
│                                          │
│        📭  No transactions found        │
│    for this wallet in the last 3 months  │
│                                          │
│    [Try a longer period]                 │
└──────────────────────────────────────────┘
```

---

## Section 5: Add a Token Breakdown Summary (New — currently missing)

Add a small summary row below the three stat cards showing inflow/outflow split by token:

```
┌──────────────────────────────────────────────────────────────┐
│  By Token        USDT          USDC          cUSD     CELO   │
│  Inflow:         $1,840        $1,430        $480      —     │
│  Outflow:        $95           $275          —         $240  │
└──────────────────────────────────────────────────────────────┘
```

- Display as a compact horizontal table or a series of small pill chips
- Each token tinted by its brand color (USDT green, USDC blue, cUSD yellow, CELO gold)
- Clicking a token filters the transactions table instantly

---

## Section 6: Page-Level UX Improvements

**Loading state:**
- Show skeleton rows (5 pulsing grey bars) in the table while data loads
- Show skeleton values in the stat cards

**Scroll behavior:**
- The page currently has ~400px of blank space below 6 rows — fix by either:
  - Showing more rows per page (default 10 instead of 6), or
  - Making the transactions card `min-h` fill the viewport

**"ChainScore AI" floating button (bottom-right):**
- This exists on the page — good. Consider making it context-aware:
  - When on the Statements page, clicking it opens an AI chat pre-prompted with: *"Ask me about your transactions — e.g. 'Why did my outflow spike in March?' or 'Who sent me the most payments?'"*

---

## Implementation Checklist for AI Agent

```
[ ] 1. Add Export CSV + Export PDF buttons to page header
[ ] 2. Add Search input to header
[ ] 3. Add Filter dropdown (Direction, Token, Amount range)
[ ] 4. Redesign stat cards: add mini sparkbar + trend % + remove redundant period badge
[ ] 5. Color Net Flow value dynamically (teal/red)
[ ] 6. Add savings rate line to Net Flow card
[ ] 7. Add Cash Flow bar chart (recharts BarChart, inflow/outflow pairs)
[ ] 8. Add colored left-border to each table row (teal/amber)
[ ] 9. Add token icons to TOKEN column
[10] 10. Color-code AMOUNT column with +/− prefix and directional arrow
[11] 11. Add copy icon to COUNTERPARTY column
[12] 12. Add row hover state
[13] 13. Add row expansion with full tx details
[14] 14. Make column headers sortable (Timestamp, Amount, Token)
[15] 15. Add pagination (10/25/50 per page + total count)
[16] 16. Add empty state component
[17] 17. Add Token Breakdown summary row below stat cards
[18] 18. Fix blank space — ensure table fills viewport height
[19] 19. Add skeleton loading states for table and stat cards
[20] 20. Make ChainScore AI button context-aware for the Statements page
```

---

## Priority Order

| Priority | Change | Effort |
|---|---|---|
| 1 | Color-code AMOUNT column (+/− teal/amber) | Low |
| 2 | Colored left-border on table rows | Low |
| 3 | Sortable column headers + sort indicator | Low |
| 4 | Pagination controls + total count | Low |
| 5 | Stat card sparkbars + trend % | Medium |
| 6 | Net Flow dynamic color + savings rate | Low |
| 7 | Add Search + Filter to header | Medium |
| 8 | Cash Flow bar chart | Medium |
| 9 | Token Breakdown summary row | Medium |
| 10 | Row expansion with full tx details | Medium |
| 11 | Token icons in TOKEN column | Low |
| 12 | Add copy button to COUNTERPARTY | Low |
| 13 | Export CSV / PDF buttons | Medium |
| 14 | Skeleton loading states | Low |
| 15 | Context-aware ChainScore AI button | Medium |
