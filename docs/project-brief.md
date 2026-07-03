# Chainalyse (OnFRA) — Project Brief

## Description

**Chainalyse** is an onchain financial reputation platform that turns wallet activity into lender-ready financial intelligence. Users connect a wallet, receive AI-powered scores and insights, download transaction statements, generate verified financial passports, and share attestations that lenders can verify onchain.

The platform is powered by **OnFRA** (Onchain Financial Reputation Agent), a LangChain-based AI agent registered as [ERC-8004 agent #9219 on Celo mainnet](https://8004scan.io/agents/celo/9219). OnFRA analyzes transaction history, cash flow patterns, wallet age, and asset composition to produce:

- Financial Health Score (0–100)
- Reputation Score (0–100)
- Income Stability and monthly income estimates
- Loan Capacity recommendations
- Portfolio Risk breakdown
- AI-generated financial summaries
- Verified PDF financial passports with onchain attestation

Chainalyse ships as a production-ready monorepo: a Next.js web app (with MiniPay native support), the OnFRA agent backend, and Solidity contracts (`OnchainReporter` attestation registry on Celo mainnet). It exposes REST APIs, ERC-8004 agent discovery manifests, and x402 micropayments for premium features.

**Live demo:** [wallet-profile-orpin.vercel.app](https://wallet-profile-orpin.vercel.app)  
**Demo video:** [youtu.be/7WC3lD5dDj4](https://youtu.be/7WC3lD5dDj4)

---

## Problem

**Your wallet knows your income. Your lender doesn't.**

Millions of freelancers, remote workers, creators, and DAO contributors receive payments in crypto every month. When they apply for loans, credit, or microfinance, they are asked for bank statements, payslips, and employment records that do not reflect their real onchain financial activity.

As a result, reliable earners with years of verifiable blockchain history still cannot prove their income:

- Crypto payments do not appear on traditional bank statements
- Freelancers struggle to prove recurring income across borders
- Lenders have no standard way to assess wallet reputation
- Years of financial history remain trapped inside raw blockchain data

The gap is not a lack of data — wallets already contain rich financial evidence. The gap is **translation and trust**: turning raw onchain activity into something a lender, underwriter, or financial platform can read, evaluate, and verify.

---

## Solution

Chainalyse analyzes onchain activity on Celo and transforms it into lender-ready financial intelligence. Instead of asking users for payslips and bank statements, lenders can evaluate a wallet's financial behavior through transparent blockchain data.

### How it works

1. **Connect wallet** — Sign in via Privy on web, or auto-connect inside Celo MiniPay on mobile.
2. **Analyze** — OnFRA fetches Celo transaction history, balances, and activity patterns for your connected wallet.
3. **Dashboard** — View financial health, reputation, income stability, loan capacity, portfolio risk, and an AI summary.
4. **Evidence** — Inspect underlying transactions that support every score.
5. **Statements** — Download PDF transaction statements for a selected period.
6. **Financial passport** — Generate a verified report with scores, insights, borrowing recommendations, and a verification code (`REP-{id}`).
7. **Verify onchain** — Lenders paste the code at `/verify` to confirm the report was issued by Chainalyse and registered on the `OnchainReporter` contract on Celo mainnet.
8. **Chat with OnFRA** — Ask the agent anything in natural language: your scores, income patterns, loan readiness, risk exposure, or what a report means. **Questions about your own wallet are free.** Want to look up someone else? Point OnFRA at any external wallet address and ask anything about it for **0.01 USDT** via x402. Need a lender-ready document? OnFRA can generate a verified financial passport for **0.10 USDT** — for your wallet or any address you specify.

### What makes it credible

- **Onchain attestations** — Report hashes are published to the `OnchainReporter` UUPS contract and pinned to IPFS.
- **Public verification** — Anyone can verify a report by code via the web UI, API, or direct contract call.
- **ERC-8004 agent** — OnFRA is discoverable as a registered AI agent with analyze, chat, report, and verify capabilities — usable by humans and other agents alike.
- **Transparent methodology** — Scoring formulas and rules are documented and auditable.
- **Fair, pay-per-use pricing** — Own-wallet analysis and chat are free; external wallet lookups cost 0.01 USDT; verified passports cost 0.10 USDT. All paid actions settle in USDT on Celo via x402 — no subscriptions, no hidden fees.
- **MiniPay-native** — Runs inside the Celo wallet app with mobile-first UX and seamless USDT micropayments.

### Who it helps

| Audience | Value |
|----------|-------|
| Freelancers & creators | Prove crypto income without traditional payslips |
| Remote workers | Demonstrate cross-border recurring payments |
| DAO contributors | Show consistent onchain earnings history |
| Lenders & underwriters | Assess wallet reputation with verifiable attestations |
| Microfinance platforms | Integrate via REST API or ERC-8004 agent discovery |

---

## Mission Summary

Chainalyse exists to **turn crypto income into financial reputation** — readable for users, useful for lenders, and verifiable onchain.

More people every day are choosing stablecoins not just to get paid, but to save, send money home, and build a financial life outside traditional banking. We believe that future is already arriving: wages, remittances, and everyday savings will increasingly live onchain in dollar-pegged assets — especially in mobile-first markets like Celo. When that happens, bank statements and payslips stop being the story. Wallets become the ledger of record.

Our mission is to make that onchain history count. Chainalyse gives stablecoin earners and savers a way to prove their financial reputation — income consistency, savings discipline, wallet maturity — in language lenders, underwriters, and platforms already understand. We start where this shift is most visible: the Celo ecosystem, where millions of users already earn and hold in stablecoins through apps like MiniPay.

OnFRA is the AI layer that bridges raw blockchain data and real-world financial decisions. Chainalyse is the product that delivers that intelligence to users and partners through a polished experience, verifiable reports, and open integration surfaces (API, ERC-8004, x402).

**Core principles:**

- **Wallet as source of truth** — No manual forms; onchain activity speaks for itself.
- **Evidence, not just scores** — Every metric is backed by inspectable transaction data.
- **Verifiable by design** — Reports are tamper-evident via onchain registration and IPFS.
- **Accessible** — Free for own-wallet analysis; affordable micropayments for premium and third-party queries.
- **Agent-native** — Built for the ERC-8004 era of discoverable, composable AI financial services.

---

## Milestones (Future)

The product is **built and live**. The next phase focuses on **distribution**, **OnFRA agent quality**, **multi-chain expansion**, and **UI polish**.

### Traction & July targets

**Current:** 10 wallets analyzed · 8 verified reports published onchain

**Goal by end of July:** 100 wallets analyzed · 60 verified reports published

We plan to get there through a mix of product-led growth and targeted distribution:

- **MiniPay launch** — List Chainalyse in the MiniPay app store so Celo wallet users can discover and analyze their wallets in one tap, with USDT micropayments built in for reports.
- **Free own-wallet analysis** — Lower the barrier to first use: connect, analyze, and chat with OnFRA about your wallet at no cost, then upsell the verified financial passport (0.10 USDT) once users see their scores.
- **Content & demos** — Share the [demo video](https://youtu.be/7WC3lD5dDj4), post wallet-analysis walkthroughs on [@chainalyse_xyz](https://x.com/chainalyse_xyz), and target freelancer, creator, and DAO communities where stablecoin income is common.
- **Ecosystem visibility** — Participate in Celo builder programs (e.g. Proof of Ship S2), hackathon showcases, and grant ecosystems like Karma to reach builders and early adopters who will test and share the product.
- **Report-driven use cases** — Position the verified financial passport for loan applications, gig-platform onboarding, and cross-border income proof — use cases where users have a clear reason to pay for the 0.10 USDT attestation, not just the free dashboard.
- **Lender & MFI outreach** — Pilot with microfinance platforms and fintech lenders who can refer borrowers to generate Chainalyse reports, driving both wallet analyses and paid attestations from the B2B side.

### 1. Distribution & go-to-market

With the core product shipped, distribution is the priority. We are pursuing MiniPay Mini App listing, Celo ecosystem programs for visibility and grants, and direct outreach to lenders and microfinance platforms that need alternative income verification. On the integration side, we are promoting the REST API and ERC-8004 agent discovery so third-party apps and agents can call OnFRA programmatically. Community growth through X, case studies, and freelancer/creator channels will drive organic wallet analyses. Production URL: `https://wallet-profile-orpin.vercel.app` (canonical for app, manifests, and agent metadata).

### 2. OnFRA agent improvements

OnFRA is the intelligence layer behind every score, chat response, and report. Making it better directly improves user trust and conversion to paid attestations. Planned improvements include richer natural-language understanding for financial questions, more accurate income-pattern detection across recurring stablecoin inflows, sharper loan-capacity and risk recommendations, faster analysis for wallets with long transaction histories, and better contextual chat that references specific scores and transactions inline. We also want OnFRA to handle edge cases more gracefully — dormant wallets, multi-token portfolios, and cross-protocol DeFi activity — so the agent gives useful answers even when a wallet profile is unconventional. Feedback collected via the ERC-8004 reputation registry and real user sessions will guide prioritization.

### 3. Multi-chain integration

Chainalyse currently analyzes **Celo mainnet** (chain ID 42220). Many stablecoin earners receive payments across multiple networks, so expanding chain coverage is a natural next step. We will prioritize chains with high freelancer and creator payment volume (e.g. Base, Ethereum L2s, Polygon), extend OnFRA's data-fetch and scoring pipelines to aggregate activity across chains, and build a unified cross-chain profile in the dashboard. Attestation infrastructure will follow — deploying or adapting `OnchainReporter` on additional chains and registering OnFRA as an ERC-8004 agent wherever registries are available.

### 4. UI & experience improvements

| Milestone | Target |
|-----------|--------|
| Dashboard redesign | Clearer score visualization, improved mobile layouts, and faster time-to-insight after wallet connect |
| Onboarding flow | Streamlined first-run experience: connect → analyze → understand scores in under 60 seconds |
| Report & statement UX | Richer financial passport preview, easier sharing, and clearer verification instructions for lenders |
| Chat experience | More contextual OnFRA chat with inline score references and suggested questions |
| Performance | Improve PageSpeed and perceived load time on mobile (MiniPay target: 360×640+) |
| Accessibility & i18n | Broader language support for Celo's global user base |

### Success metrics

- **Traction (July):** 100 wallets analyzed, 60 verified reports published
- **Distribution:** MiniPay installs, monthly active wallets, lender verification lookups
- **OnFRA:** Chat satisfaction, report completion rate, analysis accuracy feedback
- **Multi-chain:** Number of chains supported, % of users with cross-chain profiles
- **UI:** Mobile conversion (connect → analyze), session duration on dashboard, NPS

---

## Links

| Resource | URL |
|----------|-----|
| Live demo | [wallet-profile-orpin.vercel.app](https://wallet-profile-orpin.vercel.app) |
| Demo video | [youtu.be/7WC3lD5dDj4](https://youtu.be/7WC3lD5dDj4) |
| Documentation | [docs/](./README.md) |
| GitHub | [github.com/jeffIshmael/wallet-profile](https://github.com/jeffIshmael/wallet-profile) |
| X / Twitter | [@chainalyse_xyz](https://x.com/chainalyse_xyz) |
| OnFRA (ERC-8004) | [8004scan.io/agents/celo/9219](https://8004scan.io/agents/celo/9219) |
| OnchainReporter | [celoscan.io](https://celoscan.io/address/0xE7621aF5dE3806ba26115bdC89190c65ed835C21) |
