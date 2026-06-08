# Landing Page Update Specification

## Objective

Update the current landing page messaging to better communicate the core problem that ChainScore solves:

> Crypto earners have real income, but traditional lenders cannot easily verify it.

The current problem section should be rewritten to focus on proof of income, financial visibility, and lending accessibility rather than generic crypto statistics.

Additionally, add a new Solution section directly after the Problem section with a black background to create visual separation and improve storytelling.

---

# Problem Section Update

## Goal

Make visitors immediately understand:

* Who the product is for.
* Why crypto earners struggle to access credit.
* Why traditional financial institutions cannot evaluate onchain income.
* Why ChainScore is needed.

---

## Replace Existing Headline

Current:

```txt
Crypto earners are financially invisible
```

Replace with:

```txt
Your wallet knows your income.
Your lender doesn't.
```

The second line should be highlighted using the brand accent color.

---

## Replace Description

Current messaging is too generic.

Replace with:

```txt
Millions of freelancers, remote workers, creators and DAO contributors receive payments in crypto every month. Yet when applying for loans, they are asked for bank statements, payslips and employment records that don't reflect their real financial activity.

As a result, reliable earners are often unable to prove their income despite having years of verifiable onchain history.
```

---

## Update Pain Points

Replace the current list with:

```ts
const painPoints = [
  "Crypto payments don't appear on traditional bank statements",
  "Freelancers struggle to prove recurring income",
  "Lenders have no standard way to assess wallet reputation",
  "Years of financial history remain trapped inside blockchain data",
];
```

---

## Replace Right Side Statistics Cards

The current cards feel arbitrary.

Replace them with problem-oriented cards.

### Card 1

```txt
24/7
Wallet activity exists but remains difficult for lenders to understand.
```

---

### Card 2

```txt
0
Standardized proof-of-income documents for crypto earners.
```

---

### Card 3

```txt
1000s
Of transactions hidden behind a wallet address.
```

---

## Visual Enhancement

Instead of making the right side feel like statistics, make it feel like an unidentified wallet.

Suggested card design:

```txt
Wallet Profile

0x7A3...91F

+ 1,247 Transactions
+ 18 Months Activity
+ Stablecoin Income

Can this wallet qualify for a loan?
```

The final question should be visually emphasized.

This creates curiosity and naturally leads into the solution section.

---

# New Solution Section

## Placement

Immediately after the Problem section.

---

## Background

Use a pure black background.

```tsx
bg-black
```

The Problem section should remain on the existing dark surface color.

This creates a strong visual transition.

---

# Solution Section Content

## Eyebrow

```txt
The Solution
```

---

## Headline

```txt
Turn wallet activity into financial trust.
```

Highlight:

```txt
financial trust
```

using the gold accent color.

---

## Description

```txt
ChainScore analyzes onchain activity and transforms it into lender-ready financial insights, reputation scores, income verification and borrowing recommendations.

Instead of asking users for payslips and bank statements, lenders can evaluate a wallet's financial behavior through transparent blockchain data.
```

---

# Core Animation Area

Create a visual representation of the ChainScore workflow.

## Flow

```txt
Wallet Address
      ↓
     OnFRA
      ↓
Financial Health
Reputation
Income Stability
Loan Capacity
      ↓
Financial Passport
```

This should become the centerpiece of the section.

---

# Feature Cards Grid

Create a 4-card grid.

Each card should have hover animations similar to existing cards.

---

## Card 1

Title:

```txt
Financial Health
```

Description:

```txt
Measures wallet strength using income consistency, savings behavior and cash-flow patterns.
```

---

## Card 2

Title:

```txt
Reputation Score
```

Description:

```txt
Evaluates wallet maturity, transaction history and onchain trustworthiness.
```

---

## Card 3

Title:

```txt
Income Verification
```

Description:

```txt
Identifies recurring income streams and historical earning patterns directly from blockchain activity.
```

---

## Card 4

Title:

```txt
Loan Capacity
```

Description:

```txt
Estimates a responsible borrowing range based on observed financial behavior and income stability.
```

---

# Premium Report CTA

Add a large highlighted card at the bottom of the Solution section.

---

## Headline

```txt
Download a verified financial report for 0.1 USDT
```

---

## Description

```txt
Generate a professional proof-of-income report powered by OnFRA and backed by onchain financial analysis.
```

---

## Button

```txt
Generate Financial Passport
```

---

# Desired User Journey

The landing page should communicate the following story:

```txt
Crypto earners have a problem.

↓

Traditional lenders cannot understand wallet activity.

↓

ChainScore analyzes wallet activity.

↓

OnFRA generates financial intelligence.

↓

Users receive:
- Financial Health Score
- Reputation Score
- Income Verification
- Loan Capacity Estimate

↓

Users can purchase a verified Financial Passport for 0.1 USDT.

↓

Lenders gain confidence.
Borrowers gain access.
```

---

# Tone Guidelines

Use language that is:

* Professional
* Trustworthy
* Fintech-oriented
* Easy for non-crypto users to understand

Avoid:

* Excessive crypto jargon
* Technical blockchain terminology in user-facing copy
* Overly speculative language

The product should feel closer to a modern financial intelligence platform than a crypto analytics dashboard.
