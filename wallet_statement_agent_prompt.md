# AI Agent Prompt: Enhanced WalletAnalyst Transaction Statement

## Context

You are generating an enhanced onchain transaction statement for **WalletAnalyst** — a platform that bridges onchain earnings and traditional finance by transforming raw wallet activity into verifiable financial intelligence.

The statement should be suitable for use by lenders, DeFi protocols, or any party that needs to assess a wallet's financial reputation and credibility.

---

## Input Data

You will receive:
- `wallet_address` — the full Celo wallet address
- `statement_period` — start and end dates (e.g., `14/03/2026` to `12/06/2026`)
- `generated_at` — timestamp of statement generation
- `transactions` — a list of transaction objects, each with:
  - `timestamp` — ISO datetime
  - `direction` — `"Incoming"` or `"Outgoing"`
  - `token` — token name (e.g., `USDC`, `Celo`, `ONCHAIN`)
  - `counterparty` — shortened or full address
  - `amount_usd` — USD value (number)
  - `tx_hash` — full transaction hash

---

## What to Generate

Produce a **single, well-structured PDF-ready statement** with the following sections:

---

### 1. Header / Identity Block

- Platform name: **WalletAnalyst**
- Subtitle: *Onchain Transaction Statement · Celo Mainnet*
- Badge: `VERIFIED ONCHAIN ACTIVITY`
- Wallet address (full)
- Statement period (formatted as: `14 Mar 2026 – 12 Jun 2026`)
- Generated timestamp

---

### 2. Executive Summary (NEW)

A short 2–3 sentence human-readable summary of the wallet's activity during the period. Include:
- Overall activity level (e.g., "active", "low volume")
- Primary direction of flow (net receiver vs net sender)
- Dominant token used
- Any notable patterns (e.g., regular small inflows followed by periodic consolidation outflows)

**Example:**
> This wallet shows low but consistent activity over 3 months, primarily receiving USDC in small increments from a single counterparty and periodically forwarding accumulated balances. It demonstrates a relay or payment-forwarding pattern with tight net flow (+$0.01). No suspicious spikes or irregular behavior were detected.

---

### 3. Financial Summary Cards

Display the following as prominent summary metrics:

| Metric | Value |
|---|---|
| Total Paid In | Sum of all incoming USD amounts |
| Total Paid Out | Sum of all outgoing USD amounts |
| Net Flow | Paid In minus Paid Out (show + or − prefix) |
| Total Transactions | Count of all transactions |
| Statement Period | Duration in days |
| Dominant Token | Most frequently used token |
| Active Days | Number of distinct calendar days with transactions |
| Unique Counterparties | Count of distinct counterparty addresses |

---

### 4. Token Breakdown (NEW)

For each token transacted (e.g., USDC, Celo):

| Token | Incoming Count | Incoming Total (USD) | Outgoing Count | Outgoing Total (USD) | Net (USD) |
|---|---|---|---|---|---|
| USDC | ... | ... | ... | ... | ... |
| Celo | ... | ... | ... | ... | ... |

---

### 5. Counterparty Summary (NEW)

For each unique counterparty address:

| Address | Role | Interactions | Total Sent (USD) | Total Received (USD) |
|---|---|---|---|---|
| 0x9ce9...3008 | Sender | 8 | — | $0.29 |
| 0x4821...6315 | Mixed | 4 | $0.28 | $0.02 |
| ... | ... | ... | ... | ... |

**Role** should be inferred as:
- `Sender` — only sends to this wallet
- `Receiver` — this wallet only sends to them
- `Mixed` — both directions

---

### 6. Monthly Activity Breakdown (NEW)

Group transactions by calendar month and show:

| Month | Incoming Txns | Incoming (USD) | Outgoing Txns | Outgoing (USD) | Net (USD) |
|---|---|---|---|---|---|
| March 2026 | ... | ... | ... | ... | ... |
| April 2026 | ... | ... | ... | ... | ... |
| May 2026 | 0 | $0.00 | 0 | $0.00 | $0.00 |

> If a month has zero transactions, still include it in the table to show the full period coverage.

---

### 7. Full Transaction Ledger

Display all transactions in a table with the following columns:

| # | Date & Time | Direction | Token | Counterparty | Amount (USD) | Tx Hash |
|---|---|---|---|---|---|---|

**Formatting rules:**
- Dates: `15 Mar 2026, 16:09` (human-readable)
- Direction: use ▼ Incoming (green) / ▲ Outgoing (red) visual indicators where possible
- Counterparty: abbreviated as `0x9ce9...3008` (first 6 + last 4 chars)
- Amount: right-aligned, always show `$0.00` format
- Tx Hash: abbreviated to first 20 chars + `...`, linked to block explorer if HTML output (`https://celoscan.io/tx/<full_hash>`)
- Row number: sequential, starting at 1

---

### 8. Behavioral Analysis & Flags (NEW)

Run a basic heuristic analysis and surface findings. For each finding, label it as:

- ✅ `NORMAL` — expected behavior
- ⚠️ `NOTABLE` — worth noting, not necessarily problematic
- 🚩 `FLAG` — potentially unusual, warrants manual review

**Checks to run:**

| Check | Logic |
|---|---|
| Duplicate transactions | Same hash, amount, and counterparty within 60 seconds |
| Round-trip patterns | Funds sent out and returned from same address within 24h |
| Consolidation pattern | Many small inflows followed by one large outflow |
| Dormant periods | Gaps of 14+ days with no transactions |
| Concentrated counterparties | >80% of volume from/to a single address |
| Zero-value transactions | Transactions with $0.00 amount |

For the sample data, expected output:
- ⚠️ **Duplicate transaction detected**: Two identical transactions on Mar 15 (same hash `0x7c7c...`). May be a display artifact or double-indexing.
- ✅ **Consolidation pattern**: Consistent small USDC inflows followed by batch outflows — typical relay or payroll behavior.
- ⚠️ **Concentrated counterparty**: ~90% of incoming USDC volume originates from `0x9ce9...3008`.
- ⚠️ **Dormant period**: No activity between Apr 24 and Jun 12 (49 days).
- ✅ **Net flow positive**: Wallet retains a small positive balance over the period.

---

### 9. Footer / Verification Block

- Text: *"This statement is generated from verified onchain transfer events on Celo Mainnet."*
- Verification note: *"Transaction data can be independently verified on [celoscan.io](https://celoscan.io)."*
- Page number (if multi-page)
- WalletAnalyst branding

---

## Output Format

Generate the statement in **one of the following formats** depending on the task:

- **PDF** — For formal lending or financial verification use. Use a clean, professional layout with the WalletAnalyst dark-gold color scheme (`#1a1a1a` background, `#f5a623` accent, `#ffffff` text).
- **HTML** — For web preview or email delivery. Fully self-contained single file with inline CSS.
- **Markdown** — For raw data export or developer use.

---

## Tone & Style Guidelines

- Professional and neutral — this is a financial document
- Avoid jargon; spell out abbreviations on first use (e.g., "USDC (USD Coin)")
- Use consistent number formatting: `$0.01` not `0.01 USD`
- Dates always in `DD MMM YYYY` format
- Addresses always abbreviated: first 6 + `...` + last 4 characters

---

## Example Agent Invocation

```
Generate an enhanced WalletAnalyst transaction statement for:
- Wallet: 0xb10f1c8df7b25ceeedb5244f8bbef99a5af1200d
- Period: 14 Mar 2026 to 12 Jun 2026
- Format: PDF

Use the transaction data provided and include all sections:
Executive Summary, Financial Summary, Token Breakdown, Counterparty Summary,
Monthly Breakdown, Full Ledger, Behavioral Flags, and Verification Footer.
```

---

*Prompt version: 1.0 · WalletAnalyst · Jun 2026*
