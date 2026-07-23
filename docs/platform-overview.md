# Platform Overview

## The problem

Your wallet knows your income. Your lender doesn't.

Millions of freelancers, remote workers, creators, and DAO contributors receive payments in crypto every month. When they apply for loans, they are asked for bank statements, payslips, and employment records that do not reflect their real onchain financial activity.

As a result, reliable earners with years of verifiable blockchain history still cannot prove their income:

- Crypto payments do not appear on traditional bank statements
- Freelancers struggle to prove recurring income across borders
- Lenders have no standard way to assess wallet reputation
- Years of financial history remain trapped inside raw blockchain data

## The solution

Onfra analyzes onchain activity on Celo and transforms it into lender-ready financial intelligence: health scores, reputation ratings, income stability, loan capacity estimates, transaction statements, and verified financial passports.

Instead of asking users for payslips and bank statements, lenders can evaluate a wallet's financial behavior through transparent blockchain data.

## Powered by OnFRA

**OnFRA** (Onchain Financial Reputation Agent) is the AI layer behind Onfra. It is registered as [ERC-8004 agent #9219 on Celo mainnet](https://8004scan.io/agents/celo/9219) and exposes analyze, chat, report, and verify capabilities through the Onfra web app and REST API.

## User journey

1. **Connect wallet** — Sign in with Privy (web) or auto-connect via MiniPay inside the Celo wallet app.
2. **Analyze wallet** — OnFRA fetches Celo transaction history, balances, and activity patterns.
3. **View dashboard** — Financial health, reputation, income stability, loan capacity, portfolio risk, and AI summary.
4. **Inspect transactions** — Underlying onchain evidence behind every score.
5. **Download statements** — PDF transaction statements for a selected period.
6. **Generate financial passport** — Verified report with scores, insights, borrowing recommendations, and a verification code.
7. **Verify onchain** — Lenders paste the verification code at `/verify` to confirm the report was issued by Onfra and registered onchain.
8. **Chat with OnFRA** — Ask natural-language questions about the wallet, report, risk, or loan readiness.

## Key features

### Financial dashboard

- **Financial Health Score** (0–100) — composite view of wallet discipline and stability
- **Reputation Score** (0–100) — trustworthiness based on wallet age, protocol usage, and activity consistency
- **Income Stability** — recurring inflow patterns and monthly income estimates
- **Loan Capacity** — estimated safe borrowing range based on wallet behavior
- **Portfolio Risk** — stablecoin vs volatile vs DeFi vs NFT exposure breakdown
- **AI summary** — narrative explanation of the wallet profile

### Verified financial passport

A lender-ready PDF report that includes scores, income insights, borrowing recommendations, and a unique verification code (`REP-{id}`). After purchase, the report hash is published to the [OnchainReporter](https://celoscan.io/address/0xE7621aF5dE3806ba26115bdC89190c65ed835C21) contract on Celo mainnet and pinned to IPFS.

### Public verification

Anyone can verify a report at [app.onfra.xyz/verify](https://app.onfra.xyz/verify) using the verification code. The page confirms wallet address, scores, report hash, IPFS link, and onchain registry data.

### OnFRA agent chat

Conversational interface to query wallet financial reputation in natural language. Own-wallet queries are free; external wallet lookups use x402 micropayments (0.01 USDT on Celo).

### MiniPay native experience

Onfra runs inside Celo MiniPay with auto wallet connection, mobile bottom navigation, and direct USDT payments for premium features.

## Who it helps

- **Freelancers and creators** — Prove crypto income without traditional payslips
- **Remote workers** — Demonstrate cross-border recurring payments
- **DAO contributors** — Show consistent onchain earnings history
- **Lenders and underwriters** — Assess wallet reputation with verifiable onchain attestations
- **Microfinance platforms** — Integrate via REST API or ERC-8004 agent discovery

## Pricing (x402 micropayments)

| Action | Cost |
|--------|------|
| Own wallet analysis / chat | Free |
| External wallet query | 0.01 USDT |
| Verified financial passport | 0.10 USDT |

Payments settle in USDT on Celo via x402.

## Links

- **Demo:** [app.onfra.xyz](https://app.onfra.xyz)
- **Video walkthrough:** [youtu.be/7WC3lD5dDj4](https://youtu.be/7WC3lD5dDj4)
- **X:** [@onfra_xyz](https://x.com/onfra_xyz)
- **OnFRA agent:** [8004scan.io/agents/celo/9219](https://8004scan.io/agents/celo/9219)
