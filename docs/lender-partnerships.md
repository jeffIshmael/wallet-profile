# Lender & Credit Partner Outreach

Chainalyse partnership materials for Celo ecosystem lenders, microfinance platforms, and fintech rails.

**Live product:** [wallet-profile-orpin.vercel.app](https://wallet-profile-orpin.vercel.app)  
**Demo video:** [youtu.be/7WC3lD5dDj4](https://youtu.be/7WC3lD5dDj4)  
**OnFRA (ERC-8004):** [8004scan.io/agents/celo/9219](https://8004scan.io/agents/celo/9219)

---

## Partner list & contacts

| Priority | Project | Type | Contact |
|----------|---------|------|---------|
| 1 | [Feather](https://feather.zone) | Morpho vault curator on Celo | **info@feather.zone** · [X @Featherlend](https://x.com/Featherlend) · [Telegram](https://t.me/featherlend) |
| 2 | [EthicHub](https://www.ethichub.com) | P2P microfinance on Celo | **investors@ethichub.com** · **info@ethichub.com** · [Telegram EN](https://t.me/ethichubeng) |
| 3 | [Pretium](https://pretium.africa) | Payments / MiniPay Shop & Pay | [X @PretiumApp](https://x.com/PretiumApp) · [LinkedIn](https://linkedin.com/company/pretium-finance) · [Telegram](https://t.me/+-8nyVGLheGhkZjA0) |
| 4 | [Morpho](https://morpho.org) | Lending markets on Celo | [Contact form](https://morpho.org) · [Discord](https://discord.com/invite/BWXbJMHMdz) · [X @MorphoLabs](https://x.com/MorphoLabs) |
| 5 | [Aave V3](https://aave.com) | Largest lending market on Celo | [Talk to Sales](https://aave.com) · [Discord](https://discord.gg/aave) · [X @aave](https://x.com/aave) |
| 6 | [Walapay](https://www.walapay.io) | Cross-border remittance (MiniPay) | [Docs](https://docs.walapay.io) · [X @walapay_io](https://x.com/walapay_io) · [LinkedIn](https://linkedin.com/company/walapay) |
| — | [Self Protocol](https://self.xyz) | ZK identity (bundle partner) | [X @selfprotocol](https://x.com/selfprotocol) · [Docs](https://docs.self.xyz) |
| — | [Bridge (Stripe)](https://www.bridge.xyz) | Fiat ↔ stablecoin B2B API | [API docs](https://apidocs.bridge.xyz) |

---

## One-page partnership brief

### Chainalyse — Onchain financial reputation for lenders

**The problem**  
Millions of users on Celo and MiniPay earn, save, and spend in USDT — but have no bank statements. When they apply for a loan, lenders see a wallet address, not a financial history they can underwrite.

**What Chainalyse does**  
Chainalyse turns Celo wallet activity into lender-ready financial intelligence:

- Financial Health Score & Reputation Score (0–100)
- Income stability classification and monthly income estimates
- Loan capacity recommendations and portfolio risk breakdown
- AI-generated financial summaries backed by inspectable transaction evidence
- **Verified Financial Passport** — a tamper-evident PDF with onchain attestation (`REP-{id}`)

**How verification works**  
Report hashes are published to the `OnchainReporter` contract on Celo mainnet and pinned to IPFS. Any lender can verify a report at [wallet-profile-orpin.vercel.app/verify](https://wallet-profile-orpin.vercel.app/verify), via API, or by calling the contract directly.

| Resource | Link |
|----------|------|
| Live app | [wallet-profile-orpin.vercel.app](https://wallet-profile-orpin.vercel.app) |
| OnchainReporter | `0xE7621aF5dE3806ba26115bdC89190c65ed835C21` |
| OnFRA agent (ERC-8004 #9219) | [8004scan](https://8004scan.io/agents/celo/9219) |
| Demo video | [youtu.be/7WC3lD5dDj4](https://youtu.be/7WC3lD5dDj4) |

**Powered by OnFRA**  
OnFRA is a LangChain-based AI agent registered on Celo via ERC-8004. It analyzes transaction history, cash flow patterns, wallet age, and asset composition. Integrators can call it via REST API, agent discovery (A2A/MCP), or programmatic x402 micropayments.

**Pricing model**

| Action | Cost |
|--------|------|
| Borrower analyzes own wallet | Free |
| Lender queries external wallet | 0.01 USDT (x402) |
| Verified financial passport | 0.10 USDT (x402) |

No subscriptions. Pay-per-use in USDT on Celo.

**Why partner with Chainalyse**

| For lenders | For borrowers |
|-------------|---------------|
| Underwrite wallet-native earners without bank statements | Prove crypto income without payslips |
| Verifiable, onchain attestations — not self-reported PDFs | Free dashboard; pay only for lender-ready passport |
| API / ERC-8004 / x402 integration surfaces | MiniPay-native UX with USDT micropayments |
| Emerging-market focus aligned with Celo & MiniPay | Works for freelancers, gig workers, remittance earners |

**Proposed pilot**

1. Lender requires a Chainalyse Financial Passport (`REP-{id}`) during loan onboarding for wallet-native borrowers.
2. Borrower connects wallet (free analysis) → generates verified passport (0.10 USDT, lender-funded or borrower-paid).
3. Lender verifies the `REP-{id}` code via web UI, API, or onchain call before approval.
4. Measure: time-to-underwrite, default rate vs. control group, conversion rate of referred borrowers.

**Integration options**

- **Embed verify page** — link to `/verify` in your onboarding flow
- **REST API** — programmatic report generation and verification
- **ERC-8004 agent** — other agents and apps discover and call OnFRA
- **x402** — pay-per-lookup micropayments for batch screening
- **White-label** (future) — branded passport with your logo for co-marketing

**Traction**

- 10+ wallets analyzed, 8+ verified reports onchain (growing)
- MiniPay Mini App listing in progress
- Built on Celo mainnet; multi-chain expansion planned

**Contact**

Jeff Ishmael · [@chainalyse_xyz](https://x.com/chainalyse_xyz) · [GitHub](https://github.com/jeffIshmael/wallet-profile)

---

## Outreach emails

Copy, personalize the `[bracketed]` lines, and send. Subject lines are included per partner.

---

### Email 1 — Feather

**To:** info@feather.zone  
**Subject:** Partnership: wallet reputation layer for Morpho borrowers on Celo

Hi Feather team,

I'm Jeff, founder of [Chainalyse](https://wallet-profile-orpin.vercel.app) — an onchain financial reputation platform on Celo. We turn wallet activity into lender-ready scores, income analysis, and verified financial passports with onchain attestation.

I saw Feather's work curating Morpho vaults on Celo for emerging-market users. That's exactly the audience we built for: people who earn and hold in USDT but have no bank statements when they want to borrow.

**What we'd like to explore:** integrating Chainalyse as a borrower verification step before loan approval — your users connect their wallet (free), generate a verified passport (`REP-{id}`), and you verify it onchain before extending credit. We handle the intelligence layer; you keep the lending relationship.

**Why now:** Chainalyse is live on Celo mainnet with onchain attestations, an ERC-8004 AI agent ([OnFRA #9219](https://8004scan.io/agents/celo/9219)), and x402 micropayments. Demo: [youtu.be/7WC3lD5dDj4](https://youtu.be/7WC3lD5dDj4).

Would you be open to a 20-minute call to discuss a small pilot? Happy to walk through a live wallet analysis and show how verification works for lenders.

Best,  
Jeff Ishmael  
Chainalyse · [@chainalyse_xyz](https://x.com/chainalyse_xyz)

---

### Email 2 — EthicHub

**To:** investors@ethichub.com  
**CC:** info@ethichub.com  
**Subject:** Partnership: onchain income verification for EthicHub borrowers on Celo

Hi EthicHub team,

I'm Jeff, building [Chainalyse](https://wallet-profile-orpin.vercel.app) — we translate Celo wallet activity into financial reputation that lenders can verify onchain.

EthicHub's mission (connecting unbanked farmers and communities with onchain lending) maps directly to the gap we solve: borrowers have real financial activity onchain, but no standard way to prove income or repayment capacity to underwriters.

**What Chainalyse offers:**

- Financial Health & Reputation scores (0–100) from transaction history
- Income stability estimates and loan capacity recommendations
- Verified Financial Passports with onchain attestation (`REP-{id}`) — tamper-evident, verifiable by any lender at `/verify`
- Free for borrowers to analyze their own wallet; 0.10 USDT per verified passport

**Pilot idea:** require a Chainalyse passport during EthicHub loan onboarding for borrowers with Celo wallet history. You verify the `REP-{id}` before disbursement — no new KYC vendor, just richer financial evidence on top of what you already collect.

Live demo: [wallet-profile-orpin.vercel.app](https://wallet-profile-orpin.vercel.app) · Video: [youtu.be/7WC3lD5dDj4](https://youtu.be/7WC3lD5dDj4)

Would love 20 minutes to explore fit. Open to your thoughts on where this slots into your existing flow.

Best,  
Jeff Ishmael  
Chainalyse · [@chainalyse_xyz](https://x.com/chainalyse_xyz)

---

### Email 3 — Pretium

**To:** (via [LinkedIn](https://linkedin.com/company/pretium-finance) or [Telegram](https://t.me/+-8nyVGLheGhkZjA0))  
**Subject:** Partnership: financial reputation for Pretium / MiniPay users applying for credit

Hi Pretium team,

I'm Jeff, founder of [Chainalyse](https://wallet-profile-orpin.vercel.app). We help lenders assess wallet-based income — the kind your MiniPay users already have but can't put on a bank statement.

Pretium moves stablecoins across Africa for everyday payments. Many of those users will eventually need credit — and lenders will ask for income proof that doesn't exist in traditional banking.

**Partnership angle:** Pretium refers users who need credit to Chainalyse; they generate a verified financial passport (`REP-{id}`) that a lender can verify onchain. Pretium doesn't need to become a lender — you become the distribution channel for a verification layer your payment users will need.

**What's live today:**

- Celo-native wallet analysis (free for own wallet)
- Verified passports with onchain attestation (0.10 USDT via x402)
- MiniPay-compatible UX
- ERC-8004 agent for programmatic integration

Demo: [youtu.be/7WC3lD5dDj4](https://youtu.be/7WC3lD5dDj4)

Open to a quick call to see if there's a co-marketing or referral pilot worth testing?

Best,  
Jeff Ishmael  
Chainalyse · [@chainalyse_xyz](https://x.com/chainalyse_xyz)

---

### Email 4 — Morpho

**To:** (via [morpho.org contact](https://morpho.org) or [Discord](https://discord.com/invite/BWXbJMHMdz))  
**Subject:** Integration proposal: wallet reputation for Morpho borrowers on Celo

Hi Morpho team,

I'm Jeff, building [Chainalyse](https://wallet-profile-orpin.vercel.app) — onchain financial reputation for Celo wallets. We generate lender-ready scores, income analysis, and verified financial passports with onchain attestation.

Morpho's Celo expansion targets emerging-market borrowers who earn in stablecoins. Chainalyse gives those borrowers a way to prove financial history that collateral ratios alone don't capture — income consistency, wallet maturity, cash flow patterns.

**Proposal:** explore Chainalyse as a pre-borrow verification layer for Morpho markets on Celo. Borrowers submit a `REP-{id}` passport; curators (e.g. Feather) or integrators verify via API or onchain before loan approval.

**Stack:** REST API · ERC-8004 agent ([#9219](https://8004scan.io/agents/celo/9219)) · x402 micropayments · `OnchainReporter` attestations on Celo mainnet.

Happy to share a one-pager and live demo. Would a short call work?

Best,  
Jeff Ishmael  
Chainalyse · [@chainalyse_xyz](https://x.com/chainalyse_xyz)

---

### Email 5 — Aave

**To:** (via [aave.com → Talk to Sales](https://aave.com))  
**Subject:** Partnership: alternative credit data for Aave borrowers on Celo

Hi Aave team,

I'm Jeff, founder of [Chainalyse](https://wallet-profile-orpin.vercel.app). We turn Celo wallet activity into verifiable financial reputation — scores, income estimates, and onchain-attested financial passports.

Aave V3 on Celo serves users who hold and earn in USDT but often lack traditional credit files. Chainalyse adds a wallet-native underwriting signal: income stability, cash flow patterns, and loan capacity — all backed by inspectable transaction data and onchain verification (`REP-{id}`).

**Integration surfaces:** REST API, ERC-8004 agent discovery, x402 pay-per-lookup. Live on Celo mainnet with `OnchainReporter` attestations.

Demo: [youtu.be/7WC3lD5dDj4](https://youtu.be/7WC3lD5dDj4) · Agent: [8004scan.io/agents/celo/9219](https://8004scan.io/agents/celo/9219)

Would your BD or ecosystem team be open to exploring a pilot for Celo borrowers?

Best,  
Jeff Ishmael  
Chainalyse · [@chainalyse_xyz](https://x.com/chainalyse_xyz)

---

### Email 6 — Walapay

**To:** (via [LinkedIn](https://linkedin.com/company/walapay) or [docs contact](https://docs.walapay.io))  
**Subject:** Partnership: income verification for Walapay remittance earners seeking credit

Hi Walapay team,

I'm Jeff, building [Chainalyse](https://wallet-profile-orpin.vercel.app) — we convert stablecoin wallet history into lender-ready financial reputation with onchain verification.

Walapay users receive cross-border payments in USDT via MiniPay. When those users apply for loans or credit, lenders ask for bank statements that don't reflect their real income. Chainalyse fills that gap.

**Partnership model:** Walapay refers credit-seeking users to generate a verified financial passport; lenders verify the `REP-{id}` onchain. You stay in the payments lane; we handle financial intelligence.

Live on Celo · MiniPay-native · ERC-8004 agent · x402 micropayments.  
Demo: [youtu.be/7WC3lD5dDj4](https://youtu.be/7WC3lD5dDj4)

Open to a brief call to explore a referral pilot in NG/KE/GH?

Best,  
Jeff Ishmael  
Chainalyse · [@chainalyse_xyz](https://x.com/chainalyse_xyz)

---

## General template (any partner)

**Subject:** Partnership: onchain financial reputation for [Partner] borrowers on Celo

Hi [Name / team],

I'm Jeff, founder of [Chainalyse](https://wallet-profile-orpin.vercel.app). We help lenders assess borrowers who earn in stablecoins but have no traditional credit file.

[One sentence about why this partner specifically — their users, market, or product.]

Chainalyse analyzes Celo wallet activity and produces lender-ready scores, income estimates, and verified financial passports with onchain attestation (`REP-{id}`). Borrowers analyze their own wallet for free; verified passports cost 0.10 USDT.

**Pilot:** require a Chainalyse passport during loan onboarding → verify `REP-{id}` before approval.

Demo: [youtu.be/7WC3lD5dDj4](https://youtu.be/7WC3lD5dDj4) · Live app: [wallet-profile-orpin.vercel.app](https://wallet-profile-orpin.vercel.app)

Would you be open to a 20-minute call?

Best,  
Jeff Ishmael  
Chainalyse · [@chainalyse_xyz](https://x.com/chainalyse_xyz)
