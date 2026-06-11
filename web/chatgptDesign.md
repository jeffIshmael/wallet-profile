# Agent Chat Section Redesign Specification

## Goal

Redesign the current "Agent Chat" section to feel like a premium AI fintech product instead of a simple marketing block.

The current version is functional, but it feels like:

- Text on the left
- Phone on the right
- Generic AI section

We want it to feel like:

> "This is the financial intelligence layer of the platform."

The user should immediately understand:

1. OnFRA is an AI financial analyst.
2. It can explain scores and reputation.
3. It can investigate wallets.
4. It can generate lender-friendly insights.
5. It feels powerful and interactive.

Do NOT change the existing color palette.

Keep:
- btc-orange
- teal
- black / void backgrounds
- existing typography system

---

# New Section Structure

Instead of:

------------------------------------------------
| Text                                   Phone |
------------------------------------------------

Use:

------------------------------------------------
|               SECTION HEADER                |
------------------------------------------------
|                                              |
|     AI CHAT PANEL     |     PHONE MOCKUP     |
|                                              |
------------------------------------------------

The chat panel should feel like a terminal/dashboard.

---

# Header

Replace:

"Talk to OnFRA about your wallet"

With:

## Heading

Talk to your onchain financial analyst

## Subtitle

OnFRA explains your wallet like a human financial advisor.

Ask questions about income stability, reputation, portfolio risk, financial health, and borrowing capacity.

Get lender-friendly insights in seconds.

---

# AI Agent Capabilities

Replace bullet list with capability cards.

Instead of:

• Ask about financial health
• Ask about reputation

Create 4 mini cards.

Layout:

Desktop:
2 × 2 grid

Mobile:
1 column

Each card contains:

### Financial Health

Understand how healthy your wallet is and what affects your score.

---

### Reputation Analysis

See how lenders and institutions may evaluate your wallet.

---

### Loan Capacity

Discover a safe borrowing range based on your activity.

---

### Wallet Investigations

Analyze external wallets before sending funds or extending credit.

---

# Add Suggested Prompts

Below capability cards.

Title:

### Try asking OnFRA

Render suggestion chips.

Examples:

"Why is my reputation score low?"

"What loan can I safely afford?"

"How stable is my income?"

"Analyze this wallet"

"What affects my financial health?"

"Summarize my last 6 months"

Hover effect:

- subtle orange glow
- slightly lift

These should feel clickable.

---

# Pricing Box Upgrade

Current pricing notice is too plain.

Replace with a pricing card.

Title:

### Usage Pricing

Inside:

🟢 Your wallet analysis
Free

🟠 External wallet analysis
0.005 USDT

🟠 Official Financial Passport
0.10 USDT

Small footer:

Payments are processed instantly through x402.

Style:

- glass card
- orange border
- subtle glow

---

# Phone Mockup Improvements

Current conversation is too generic.

The AI should showcase actual platform value.

Replace conversation with:

User:
Why is my reputation score only 72?

OnFRA:
Your score is reduced by limited wallet age and irregular inflows. However, your transaction history shows strong stablecoin activity and no suspicious behavior.

---

User:
What loan range can I safely afford?

OnFRA:
Based on your last 6 months of income, a sustainable borrowing range is between $1,800 and $2,400.

---

User:
How can I improve my score?

OnFRA:
Maintain recurring inflows, grow your savings balance, and reduce portfolio concentration in volatile assets.

This immediately demonstrates the product.

---

# Add Floating Insights Around Phone

Around the phone mockup add floating stat cards.

Examples:

Financial Health
86%

Income Stability
Stable Earner 🐝

Loan Capacity
$1,800-$2,400

Portfolio Risk
Low

Wallet Reputation
78/100

Animate them gently.

Effects:

- float
- drift
- subtle glow

Do not overdo animations.

---

# Section Background Enhancement

Keep black background.

Add:

- large blurred btc-orange glow behind phone
- small teal glow on opposite side
- subtle grid pattern at 3% opacity

This makes the section feel premium.

---

# CTA Upgrade

Current CTA:

"Ask Agent"

Replace with:

If authenticated:

"Open OnFRA"

If not authenticated:

"Connect Wallet"

Add secondary button:

"View Sample Report"

This opens a demo PDF preview.

Layout:

[ Open OnFRA ]
[ View Sample Report ]

Desktop:
side-by-side

Mobile:
stacked

---

# Trust Indicator Row

Add below CTA.

Small horizontal row:

✓ Wallet analysis

✓ AI explanations

✓ Reputation insights

✓ Loan assessments

✓ x402 payments

Use muted styling.

This creates confidence.

---

# Visual Hierarchy

Order:

1. Section label
2. Headline
3. Subtitle
4. Capability cards
5. Suggested prompts
6. Pricing card
7. CTA buttons
8. Trust indicators

Right side:

1. Phone mockup
2. Floating financial insight cards

---

# Desired Feeling

The section should feel like:

- Perplexity for financial reputation
- ChatGPT for onchain credit
- Bloomberg Terminal meets Web3
- Premium fintech product

Not:

- Generic chatbot section
- Landing page filler content

When users reach this section they should immediately think:

"I want to ask this thing questions about my wallet."