# Celo Frontier Grant Application — Onfra (OnFRA)

Copy-paste answers for [frontier.prezenti.xyz](https://frontier.prezenti.xyz).  
Optional file upload: attach `docs/project-brief.md` or link to the GitHub repo.

---

## Describe your project

```
Onfra is an onchain financial reputation platform for the Celo ecosystem, powered by OnFRA (Onchain Financial Reputation Agent).

The problem: millions of freelancers, remote workers, creators, and DAO contributors earn and save in stablecoins, but lenders still ask for bank statements and payslips that don't reflect their real onchain financial history. Reliable earners cannot prove income despite years of verifiable wallet activity.

The solution: Onfra connects a Celo wallet, OnFRA analyzes transaction history and stablecoin flows, and the user receives lender-ready financial intelligence — health scores, reputation ratings, income stability, loan capacity, portfolio risk, AI summaries, PDF statements, and verified financial passports with onchain attestation.

OnFRA is registered as ERC-8004 agent #9219 on Celo mainnet and is discoverable via agent.json, agent-card.json (A2A), and MCP manifests. Other agents and builders can call OnFRA programmatically through REST API endpoints (/api/agent/analyze, /chat, /report, /verify) with x402 micropayments in USDT on Celo.

Pricing: own-wallet analysis and chat are free; external wallet queries cost 0.01 USDT; verified financial passports cost 0.10 USDT.

Current traction: 10 wallets analyzed, 8 verified reports published onchain. Target by end of July: 100 wallets analyzed, 60 reports published.

The product is live, open source (MIT), and MiniPay-native.
```

---

## Infrastructure focus

```
OnFRA is enabling infrastructure, not just a standalone consumer app.

Other builders and agents can integrate Onfra/OnFRA as financial-reputation infrastructure for Celo wallets:

1. ERC-8004 discovery — OnFRA (#9219) is registered on the Celo Identity Registry with public agent.json, A2A agent-card.json, and MCP manifests at /.well-known/. Any agent registry crawler or orchestrator can discover and invoke financial analysis, chat, report generation, and verification capabilities.

2. REST API + JSON schemas — Machine-readable endpoints at /api/agent/* with published request/response schemas at /schemas/*. Agents can analyze wallets, run multi-turn chat, generate verified attestations, and verify reports without building their own scoring or attestation stack.

3. OnchainReporter contract — A UUPS attestation registry on Celo mainnet (0xE7621aF5dE3806ba26115bdC89190c65ed835C21) where verified report hashes are published after x402 payment. Lenders, MFIs, and other agents can verify attestations onchain via verifyReport() or the public /verify API.

4. x402 micropayment rail — Agents pay per request in USDT on Celo (0.01 USDT for external wallet queries, 0.10 USDT for verified reports), making OnFRA composable in agent-to-agent workflows without subscriptions or API keys.

Use cases for other builders:
- Lending agents that need wallet reputation before underwriting
- Gig-platform agents that verify freelancer income on Celo
- MFI mini-apps that request proof-of-income attestations
- Agent orchestrators that chain OnFRA analysis into broader financial workflows

Onfra is the reference UI and distribution layer; OnFRA is the reusable financial-intelligence and attestation infrastructure underneath.
```

---

## Verifiable onchain activity

```
Onfra has live, verifiable onchain activity on Celo mainnet:

Deployed infrastructure:
- OnchainReporter (UUPS proxy): 0xE7621aF5dE3806ba26115bdC89190c65ed835C21
  https://celoscan.io/address/0xE7621aF5dE3806ba26115bdC89190c65ed835C21
- ERC-8004 Identity Registry: 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432
- ERC-8004 Reputation Registry: 0x8004BAa17C55a88189AE136b182e5fdA19dE9b63
- OnFRA agent ID: 9219 — https://8004scan.io/agents/celo/9219

Real usage demonstrated:
- 11 wallets analyzed on production
- 8 verified financial reports published — each report requires its own onchain transaction: after a user purchases a passport (0.10 USDT via x402), our backend relayer calls publishFinancialReport() on OnchainReporter, recording the wallet, scores, loan-capacity label, and report content hash on Celo mainnet. That means 8 published reports = 8 verifiable Celoscan transactions, one per attestation.
- x402 USDT micropayments on Celo for paid queries and report purchases
- ERC-8004 agent registration and metadata URI on Celo mainnet

Sample verifiable transactions:
- Report attestation tx: https://celoscan.io/tx/0xa1cc290f6ff3b6755fec875cbc608e2a968097260f18da0081bb34752727fe4a
- x402 USDT payment sample: https://celoscan.io/tx/0x65a95a085bd2f3ccb15c451b3b30ba15998b8f39d66c157cfd775fd41356aea8

Sample report (full PDF on IPFS): PASTE_IPFS_LINK_HERE

Verification: anyone can confirm a published attestation at https://app.onfra.xyz/verify by pasting a REP-{id} code, or by calling verifyReport() on the OnchainReporter contract on Celoscan. The verify flow checks onchain registry data (wallet, scores, report hash, publish timestamp) — it does not serve the full report document. The PDF itself is pinned to IPFS; the onchain record is the tamper-evident proof that Onfra issued that report at that hash.
```

---

## Please include a demo, if possible

```
Live app: https://app.onfra.xyz
Demo video: https://youtu.be/7WC3lD5dDj4
GitHub (open source, MIT): https://github.com/jeffIshmael/wallet-profile
OnFRA on 8004scan: https://8004scan.io/agents/celo/9219
Agent card (A2A): https://app.onfra.xyz/.well-known/agent-card.json
API docs: https://github.com/jeffIshmael/wallet-profile/tree/main/docs/api.md
```

---

## How do you plan on getting agents to use your product, and what does the activation path look like for the first 10 to 100 users?

```
OnFRA serves two audiences that reinforce each other: humans using Onfra, and other agents querying OnFRA programmatically. Both paths grow the same ERC-8004 reputation — making OnFRA easier to find and trust over time.

Current traction: 10 wallets analyzed, 8 verified reports onchain (each report = one Celoscan tx). July target: 100 wallets · 60 reports.

The reputation flywheel (how usage leads to discovery):
Every interaction with OnFRA — whether a user chatting in Onfra or an agent calling our API — can end in an ERC-8004 reputation feedback transaction on Celo. After a chat session, users rate OnFRA (helpful, accurate, clear, etc.) via giveFeedback() on the Reputation Registry. Those onchain ratings accumulate on 8004scan and signal trust to other agents evaluating whether to chain us. More usage → more ratings → higher discoverability → more agent integrations → more usage.

Path A — Humans via Onfra (drives volume + ratings):
1. User discovers Onfra (MiniPay, X, lender referral, ecosystem program)
2. Connects wallet — free
3. Analyzes wallet and chats with OnFRA about scores, income, loan readiness — free for own wallet
4. Rates OnFRA after chat — onchain ERC-8004 feedback builds reputation
5. Purchases verified passport (0.10 USDT) when lender-ready proof is needed — onchain attestation via publishFinancialReport()

Path B — Agents via API/MCP (drives chaining + propagation):
1. Agent discovers OnFRA via ERC-8004 registry (#9219), 8004scan, agent-card.json, or mcp.json
2. Reads skills, x402 pricing (0.01 USDT external query · 0.10 USDT report), and JSON schemas
3. Invokes POST /api/agent/analyze or /chat as part of a lending, underwriting, or onboarding workflow
4. Requests verified attestation via POST /api/agent/report — publishFinancialReport() records proof onchain
5. Downstream agent verifies via OnchainReporter.verifyReport() — no need to re-run analysis
6. Integrator or end user can submit ERC-8004 feedback — same reputation registry as Path A

Activation for the first 10 → 100 users (mixed):

Done (users 1–10):
- OnFRA live on ERC-8004 (#9219) with agent.json, agent-card, MCP manifests
- Onfra UI with free analysis, chat, and ERC-8004 rating flow
- OnchainReporter deployed; 8 real attestations on Celoscan
- x402 USDT payments for external queries and reports

Next (users 10–100):
- Grow human usage through MiniPay listing, marketing to stablecoin earners, and lender/MFI outreach — each user who chats and rates OnFRA strengthens our registry reputation
- Grow agent usage through hackathons, integration docs, and targeting builders who need financial-reputation tooling to chain
- Improve OnFRA conversational quality so both humans and agents get outputs worth rating and propagating
- Expand to multi-chain so OnFRA covers wallets earning across networks in one unified response
- Polish Onfra UI to improve connect → analyze → chat → rate → report conversion

Example chains:
- Human: freelancer analyzes wallet in MiniPay → chats with OnFRA → rates agent → buys passport for loan application
- Agent: lending orchestrator calls OnFRA API → gets reputation scores → requests report → passes REP-{id} to lender agent → lender verifies onchain
```

---

## What is your distribution strategy, and what examples can you point to from this project or prior work?

```
Our distribution strategy is mixed: grow human usage through Onfra to build onchain reputation, and grow agent integrations so OnFRA gets chained in automated workflows. Both paths feed the same discovery loop — the more OnFRA is used and rated, the easier it is for other agents to find and trust us on ERC-8004.

The core insight: agents finding our product is not only about registry listings. Every Onfra chat session and every API query is an opportunity for ERC-8004 reputation feedback on Celo. Ratings from real usage make OnFRA stand out on 8004scan compared to agents with no track record. Human distribution and agent distribution are not separate strategies — they compound.

1. Human distribution (Onfra → ratings → discoverability)
- MiniPay listing puts Onfra in front of Celo's stablecoin-native users
- Marketing to freelancers, creators, remote workers, and DAO contributors where onchain income is common
- Lender & MFI outreach — borrowers generate reports; lenders verify onchain at /verify
- Free own-wallet analysis + chat as the hook; 0.10 USDT verified passport as conversion
- After every chat, users can rate OnFRA onchain (helpful, accurate, clear, etc.) — building ERC-8004 reputation that other agents see

2. Agent distribution (registry → chaining → propagation)
- ERC-8004 #9219 on Celo with agent.json, A2A agent-card.json, and MCP manifests
- Discrete composable skills (analysis, reputation, income, loan capacity, verified reports)
- x402 USDT payments declared in agent-card so agents discover, pay, and invoke without subscriptions
- Onchain attestations via OnchainReporter so downstream agents verify without trusting our API alone
- Hackathons and builder outreach (Celo Frontier, Proof of Ship) targeting orchestrators who need financial tooling

3. Product improvements that support both paths
- OnFRA: better conversational NLU — humans get natural chat; agents get consistent structured outputs
- UI: smoother onboarding and mobile UX so more users complete chat and leave ratings
- Multi-chain: unified wallet profile across chains so one OnFRA call serves users and agents beyond Celo-only wallets

Examples we have actually done:
- Live ERC-8004 agent (#9219) with manifests, MCP, and reputation feedback flow in Onfra chat
- 10 wallets analyzed, 8 onchain report attestations (verifiable Celoscan txs)
- x402 agent payments in USDT on Celo
- Open-source repo (MIT) with API schemas and scoring methodology
- Demo video (youtu.be/7WC3lD5dDj4) and X presence (@onfra_xyz)
- MiniPay integration with auto-connect and mobile chat
- $120k raised to date

What we are actively working on:
- Scaling human usage (MiniPay launch, marketing, lender pilots) to generate more ratings and attestations
- Scaling agent integrations (hackathons, integration guides, agent directory listings)
- OnFRA quality and multi-chain expansion
- Systematic feedback loop: every chat and API interaction → encourage ERC-8004 rating → improve 8004scan visibility → more agents discover and chain OnFRA
```

---

## Who have you worked with before with the Celo ecosystem?

> **Form note:** Only select options where you have had **formal** engagement (not just a chat). Review and check the boxes that apply.

| Option | Suggested | Notes |
|--------|-----------|-------|
| **A — Celo Foundation** | ☐ Confirm | Select only if you had a formal program/partnership |
| **B — Celo Co Core** | ☐ Confirm | Select only if formally engaged |
| **C — Celo Dev Rel Teams** | ☐ Confirm | Select only if formally engaged |
| **D — Proof Of Ship** | ☑ Likely | Preparing/submitting for Proof of Ship S2 via celopg.eco |
| **E — Celo PG** | ☑ Likely | Proof of Ship runs through Celo PG |
| **F — Celo Camp** | ☐ Confirm | Select only if you participated in Celo Camp |

If none apply formally beyond Proof of Ship / Celo PG prep, select **D** and **E** only and mention MiniPay listing submission in Additional information.

---

## Clear contribution to the ecosystem

```
Onfra makes Celo more capable as a platform for AI and agent activity in three ways:

1. Financial-reputation infrastructure for agents
Celo has millions of stablecoin-native users, but no standard way for agents to assess wallet financial behavior. OnFRA (#9219) fills that gap — any agent on Celo can discover, pay (x402 USDT), and invoke wallet analysis, chat, and verified attestation without building scoring infrastructure from scratch.

2. ERC-8004 reference implementation
OnFRA is a live ERC-8004 agent on Celo mainnet with agent.json, A2A agent-card, MCP manifest, reputation feedback, and x402 payment metadata. This demonstrates how financial AI agents can be registered, discovered, paid, and trusted on Celo — a pattern other builders can follow.

3. Onchain attestation layer for real-world finance
The OnchainReporter contract publishes verified financial report hashes on Celo mainnet. This connects agent-generated intelligence to tamper-evident onchain proof — enabling lending agents, MFI apps, and underwriting workflows to trust agent output without a centralized intermediary.

4. MiniPay + x402 agent commerce
Onfra demonstrates agent micropayments in USDT on Celo (0.01–0.10 USDT per request) inside MiniPay — showing how agents can monetize capabilities natively in Celo's mobile wallet ecosystem.

Together, these make Celo a place where agents don't just transact — they can assess financial reputation, issue verifiable attestations, and get paid for it onchain.
```

---

## Technical credibility

```
Team demonstrates deep understanding of the problem and a credible technical approach:

Problem depth:
- Stablecoin earners and savers on Celo cannot prove income to lenders using traditional documents
- Raw blockchain data is not lender-readable; the gap is translation + verifiable trust
- Documented scoring methodology with explicit formulas for reputation, income stability, risk exposure, and loan capacity (OnFRA agent/METHODOLOGY.md)

Technical stack (shipped, not vaporware):
- OnFRA agent: LangChain + TypeScript pipelines for Celo wallet fetch, scoring, chat, and report compilation
- Web app: Next.js 14, REST API, x402 payment enforcement, Privy + MiniPay auth
- Contracts: OnchainReporter UUPS on Celo mainnet, ERC-8004 registration scripts
- Storage: PostgreSQL (Supabase) for analysis cache; IPFS (Pinata) for report content
- Agent discovery: ERC-8004 agent.json, A2A agent-card.json, MCP manifest, JSON schemas at /schemas/

Open source and public documentation:
- GitHub: https://github.com/jeffIshmael/wallet-profile (MIT license)
- Docs: architecture, API reference, onchain integration, MiniPay guide, scoring methodology
- Live production deployment with verifiable Celo mainnet transactions

Real usage:
- 10 wallets analyzed, 8 onchain report attestations published
- OnFRA agent #9219 live on 8004scan
- x402 USDT payments processing on Celo mainnet
```

---

## Additional information you consider relevant

```
Traction targets:
- Current: 10 wallets analyzed, 8 verified reports published onchain
- End of July goal: 100 wallets analyzed, 60 verified reports

Funding:
- $120k USD raised from grants/investors to date

Mission:
We believe stablecoins are becoming how people earn, save, and send money — especially on Celo/MiniPay. Onfra gives that onchain history meaning as provable financial reputation.

Next priorities (product is built; focus is growth):
1. Distribution — MiniPay listing, ecosystem programs, lender/MFI pilots
2. OnFRA agent quality — better income detection, chat accuracy, edge-case handling
3. Multi-chain expansion — extend beyond Celo to Base, L2s, Polygon
4. UI polish — onboarding, dashboard redesign, mobile performance

MiniPay submission prepared: network manifest, PageSpeed report, device test script, and listing fields ready at docs/minipay-submission.md.

Karma profile: registered for grant ecosystem visibility.

Contact: @onfra_xyz on X
```

---

## Option to upload a file if needed

Suggested attachments (pick one):

| File | Use when |
|------|----------|
| `docs/project-brief.md` | Full project overview with milestones |
| `docs/architecture.md` | Technical architecture detail |
| `OnFRA agent/METHODOLOGY.md` | Scoring methodology depth |
| Demo video URL | https://youtu.be/7WC3lD5dDj4 |

Or link directly: **https://github.com/jeffIshmael/wallet-profile**
