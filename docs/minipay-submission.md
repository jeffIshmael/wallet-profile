# MiniPay & Proof of Ship — Submission Pack

Prepared for [Chainalyse](https://wallet-profile-orpin.vercel.app). Use this document when filling the [MiniPay Mini App submission form](https://minipay.to/mini-apps) and [Proof of Ship S2](https://www.celopg.eco/programs/proof-of-ship-s2).

## Listing fields (copy-paste)

| Field | Value |
|-------|-------|
| **App name** | Chainalyse |
| **Tagline** | Turn your MiniPay wallet into lender-ready proof of income — scores, statements, and AI insights on Celo. |
| **Publisher** | Chainalyse |
| **Category** | finance |
| **App URL** | https://wallet-profile-orpin.vercel.app |
| **Support URL** | https://wallet-profile-orpin.vercel.app/support |
| **Terms of Service** | https://wallet-profile-orpin.vercel.app/terms |
| **Privacy Policy** | https://wallet-profile-orpin.vercel.app/privacy |
| **Icon (512×512)** | https://wallet-profile-orpin.vercel.app/icon-512.png |
| **Demo video** | https://youtu.be/7WC3lD5dDj4 |
| **GitHub** | https://github.com/jeffIshmael/wallet-profile |
| **ERC-8004 agent** | https://8004scan.io/agents/celo/9219 |

## Network manifest

Full origin list for the submission form:

**https://wallet-profile-orpin.vercel.app/.well-known/minipay-network-manifest.json**

## PageSpeed Insights

**Mobile report (Jun 22, 2026):** [PageSpeed Insights — wallet-profile-orpin.vercel.app](https://pagespeed.web.dev/analysis/https-wallet-profile-orpin-vercel-app/c78c5dhmn1?form_factor=mobile)

Use that link in the MiniPay submission form. Re-run at [pagespeed.web.dev](https://pagespeed.web.dev/) if you redeploy and want fresh scores.

> **Note:** Canonical production URL is `https://wallet-profile-orpin.vercel.app` (app, manifests, and ERC-8004 agent metadata).

## Technical checklist

| Requirement | Status |
|-------------|--------|
| HTTPS | ✅ wallet-profile-orpin.vercel.app |
| Auto-connect in MiniPay | ✅ `AuthProvider` MiniPay bridge |
| Mobile layout (360×640+) | ✅ responsive + bottom nav |
| Celo mainnet | ✅ chain ID 42220 |
| Legacy tx + fee abstraction | ✅ `sendMiniPayTransaction` |
| No message signing for payments | ✅ direct USDT transfer |
| Terms + Privacy in-app | ✅ `/terms`, `/privacy` |
| Support link in-app | ✅ `/support` |
| npm `minimum-release-age` | ✅ `web/.npmrc` (7 days) |
| 512×512 icon | ✅ `web/public/icon-512.png` |
| Talent App domain verification | ⚠️ Verify on `wallet-profile-orpin.vercel.app` |
| ERC-8004 metadata | ✅ `/.well-known/agent.json` |

## Smart contracts & sample transactions

| Contract | Address | Celoscan |
|----------|---------|----------|
| ERC-8004 Identity Registry | `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` | [view](https://celoscan.io/address/0x8004A169FB4a3325136EB29fA0ceB6D2e539a432) |
| ERC-8004 Reputation Registry | `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63` | [view](https://celoscan.io/address/0x8004BAa17C55a88189AE136b182e5fdA19dE9b63) |
| OnchainReporter proxy | `0xE7621aF5dE3806ba26115bdC89190c65ed835C21` | [view](https://celoscan.io/address/0xE7621aF5dE3806ba26115bdC89190c65ed835C21) |
| OnFRA agent ID | 9219 | [8004scan](https://8004scan.io/agents/celo/9219) |

Before submitting, capture fresh Celoscan links for:

- One **USDT transfer** (external wallet query or report purchase from MiniPay)
- One **ERC-8004 giveFeedback** transaction (agent rating in chat sidebar)
- One **publishFinancialReport** via OnchainReporter (verified report flow)

## Device test script (MiniPay Developer Mode)

1. Open `https://wallet-profile-orpin.vercel.app` inside MiniPay → wallet auto-connects
2. **Dashboard** → run first wallet analysis (free)
3. **Statements** → export PDF
4. **Agent chat** → ask a question about your wallet (free)
5. **Agent chat** → rate OnFRA (ERC-8004 feedback tx)
6. Optional paid: external wallet query (0.01 USDT) or verified report (0.10 USDT)
7. **Verify** → paste a report verification code
8. Footer → **Support**, **Terms**, **Privacy** load correctly

## Proof of Ship S2 (manual)

| Item | Action |
|------|--------|
| Talent App profile | Register at Talent App; domain meta tag deployed |
| Proof of Humanity | Complete valid credential (required) |
| Karma GAP | Register project + weekly milestones |
| Open source | GitHub repo public |
| Onchain traction | Real USDT txs + feedback help leaderboard score |

## Submit

- **MiniPay listing:** https://minipay.to/mini-apps
- **Proof of Ship:** https://www.celopg.eco/programs/proof-of-ship-s2
