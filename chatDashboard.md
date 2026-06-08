# ChainScore Dashboard Specification

## Design Philosophy

This dashboard should not feel like a crypto portfolio tracker.

It should feel like:

* A Financial Passport
* A Credit Assessment Dashboard
* A Proof of Income Portal

Think:

* Ramp
* Mercury
* Brex
* Stripe Dashboard

Avoid:

* Trading dashboard aesthetics
* Excessive crypto charts
* Token price focus

The user is here to understand:

1. Can I prove my income?
2. Can I qualify for a loan?
3. How trustworthy does my wallet look?
4. What would a lender think about me?

---

# Global Dashboard Rules

## Help Modals

Every section must have:

```txt
(?)
```

icon in the top right.

When clicked:

Open modal explaining:

* What the metric means
* How it is calculated
* Why lenders care

Example:

```txt
Financial Health

Measures the overall strength of your wallet
based on income consistency, savings behavior,
cash flow and portfolio composition.

Higher scores indicate stronger financial stability.
```

---

# Dashboard Layout

Desktop Layout:

```txt
┌───────────────────────────────┬──────────────┐
│                               │              │
│ Main Dashboard                │ AI Chat      │
│                               │              │
└───────────────────────────────┴──────────────┘
```

Left side:

Main dashboard.

Right side:

Collapsible AI Chat.

---

# Sidebar Navigation

Left Sidebar

Items:

```txt
Dashboard
Transaction Statements
```

Future:

```txt
Saved Reports
```

```txt
Report Verification
```

---

# 1. Wallet Summary

Small card at top.

Purpose:

Identity section.

---

Fields:

```txt
Wallet Address
ENS Name
Wallet Age
Total Transactions
First Transaction
Last Transaction
```

Example:

Wallet Age:

```txt
2 Years 4 Months
```

instead of:

```txt
28 Months
```

---

# 2. Financial Health

Most important metric.

Large featured card.

---

Display:

Circular score indicator.

Example:

```txt
89%
```

inside circle.

---

Color Rules

0-40

```txt
Red
```

---

41-70

```txt
Yellow
```

---

71-100

```txt
Green
```

---

Below score:

```txt
Excellent Financial Health
```

or

```txt
Healthy Financial Position
```

---

# 3. Income Stability

Fun section.

Users will love this.

---

Display:

```txt
Income Stability
92/100
```

Then:

Animal Badge
Flag Badge

---

Animal System

Stable Earner

```txt
🐘 Elephant
```

Reliable
Predictable
Strong

---

Growing Wallet

```txt
🦅 Eagle
```

Growing
Expanding
Strong trajectory

---

Seasonal Earner

```txt
🐬 Dolphin
```

Active in cycles
Regular peaks

---

Volatile Income

```txt
🐒 Monkey
```

Unpredictable
Highly variable

---

Whale Activity

```txt
🐋 Whale
```

Very large transfers
High-value wallet

---

Dormant Wallet

```txt
🐢 Turtle
```

Very little activity
Slow-moving wallet

---

Display Example

```txt
🐘 Elephant

Stable Earner
```

Small explanation below.

---

# 4. Wallet Reputation

Display:

```txt
92 / 100
```

Large number.

---

Status Tags

90+

```txt
Highly Trusted
```

---

75-89

```txt
Trusted
```

---

50-74

```txt
Moderate Trust
```

---

Below 50

```txt
Needs More History
```

---

Example Explanation

```txt
This wallet shows a long history of
consistent activity and healthy
financial behavior.
```

---

# 5. Portfolio Risk Exposure

Display:

```txt
Low Risk
Medium Risk
High Risk
```

Badge at top.

---

Main Visual

100% stacked vertical bar.

Example:

```txt
Stablecoins      60%
Volatile Assets  20%
DeFi Exposure    11%
NFT Exposure      9%
```

Must always total:

```txt
100%
```

---

Purpose:

Show portfolio composition.

---

# 6. Average Monthly Income

Simple KPI card.

Display:

```txt
$1,250
```

Large figure.

---

Subtext:

```txt
Average monthly inflow
over selected period.
```

---

# 7. Financial Growth Journey

Include this section.

Very useful.

---

Display:

Line chart.

Controls:

```txt
USDC
USDT
cUSD
USDm
All Assets
```

---

X-axis

Months

---

Y-axis

Value

---

Purpose

Shows financial trajectory.

Lenders care about trends.

---

# 8. Estimated Loan Capacity

Featured card.

Display:

```txt
$1,800 - $2,400
```

Large.

---

Supporting Text

```txt
Recommended borrowing range
based on income consistency,
wallet reputation and risk profile.
```

---

# 9. AI Summary

One of the most important sections.

Display as findings.

Not paragraphs.

Bullet format.

---

Example

✓ Wallet active for 2.4 years

✓ Stable monthly inflows detected

✓ Low portfolio risk exposure

✓ Strong stablecoin holdings

✓ Consistent transaction history

✓ Suitable for moderate borrowing

---

Limit:

5-8 findings.

---

# 10. Official Report Generation

Large CTA card.

---

Title

```txt
Generate Verified Financial Passport
```

---

Description

```txt
Create a lender-ready report backed by
onchain financial analysis.
```

---

Timeframe Selector

Options:

```txt
3 Months
6 Months
12 Months
```

---

Pricing

3 Months

```txt
0.10 USDT
```

---

6 Months

```txt
0.12 USDT
```

---

12 Months

```txt
0.15 USDT
```

---

Primary Button

```txt
Generate Report
```

---

# 11. Transaction Statements

Separate page/tab.

---

Time Filters

```txt
1 Month
3 Months
6 Months
12 Months
```

---

Summary Cards

Total Inflow

```txt
$5,800
```

---

Total Outflow

```txt
$3,400
```

---

Net Flow

```txt
+$2,400
```

---

Transaction Table

Columns:

```txt
Timestamp
Token
Amount
Direction
Counterparty
Transaction Hash
```

Direction:

```txt
Incoming
Outgoing
```

Use colored badges.

---

Transaction Hash

Clickable.

Copy button.

Explorer button.

---

# 12. AI Chat Panel

Right-side slideout.

Default:

Collapsed.

---

Expanded Width

Approximately:

```txt
350-400px
```

---

Suggested Prompts

Show examples.

```txt
Can this wallet qualify for a $2,000 loan?

Why is my reputation score low?

Explain my portfolio risk.

What improves my loan capacity?

Summarize this wallet for a lender.

Analyze wallet 0x...
```

---

Chat Monetization

If user analyzes another wallet:

Require x402 payment.

Example:

```txt
External Wallet Analysis

0.01 USDT Required
```

before analysis begins.

---

# Dashboard Priority

Metrics should appear in this order:

1. Wallet Summary
2. Financial Health
3. Income Stability
4. Wallet Reputation
5. Loan Capacity
6. Average Monthly Income
7. Portfolio Risk Exposure
8. Financial Growth Journey
9. AI Summary
10. Generate Report

The first screen should immediately answer:

"How healthy is this wallet and how much could it reasonably borrow?"

```
```
