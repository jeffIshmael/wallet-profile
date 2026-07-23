# MiniPay Guide

Onfra is optimized for use inside [Celo MiniPay](https://minipay.xyz) — the stablecoin wallet built into Opera Mini and available as a standalone app.

## Auto wallet connection

When opened inside MiniPay, Onfra detects the injected Ethereum provider and auto-connects the user's wallet. No separate sign-in step is required.

The auth bridge lives in `web/src/providers/AuthProvider.tsx` (`MiniPayBridge`).

## Mobile navigation

Signed-in mobile users see a bottom navigation bar with five sections:

| Tab | Route | Description |
|-----|-------|-------------|
| **Home** | `/` | Landing page with product overview |
| **Verify** | `/verify` | Paste a report verification code |
| **Dashboard** | `/dashboard` | Financial scores and analysis (featured center button) |
| **Agent chat** | `/chat` | Full-screen OnFRA chat |
| **Statements** | `/dashboard/statements` | Download transaction statements |

The bottom nav is hidden on the chat page to maximize screen space for conversation.

## Payments

MiniPay users pay for premium features (external wallet queries, verified reports) with USDT directly from their MiniPay balance via x402 settlement or direct USDT transfer (`NEXT_PUBLIC_X402_PAY_TO`).

| Feature | Cost |
|---------|------|
| Own wallet analysis / chat | Free |
| External wallet query | 0.01 USDT |
| Verified financial passport | 0.10 USDT |

## Testing in MiniPay

1. Open [app.onfra.xyz](https://app.onfra.xyz) inside MiniPay
2. Wallet connects automatically
3. Tap **Dashboard** to analyze your wallet
4. Explore scores, transactions, and statements
5. Open **Agent chat** to ask OnFRA questions
6. Rate the agent — feedback is submitted to the ERC-8004 Reputation Registry
7. Tap **Home** to return to the landing page (product overview, how it works, etc.)

## Known behavior

- **Home vs Dashboard:** The Home tab shows the marketing landing page. Dashboard shows your analyzed wallet. These are separate routes — Home no longer auto-redirects to Dashboard in MiniPay.
- **Chat full-screen:** On mobile, signed-in users get a dedicated full-screen chat experience without the bottom nav.
- **First analysis:** If you have not analyzed your wallet yet, tap Dashboard — it will prompt you to start analysis.

## Links

- **Demo:** [app.onfra.xyz](https://app.onfra.xyz)
- **Video walkthrough:** [youtu.be/7WC3lD5dDj4](https://youtu.be/7WC3lD5dDj4)
- **OnFRA agent:** [8004scan.io/agents/celo/9219](https://8004scan.io/agents/celo/9219)
- **X:** [@onfra_xyz](https://x.com/onfra_xyz)

## MiniPay submission

See [minipay-submission.md](./minipay-submission.md) for listing fields, network manifest URL, PageSpeed steps, and Proof of Ship checklist.

- **Icon:** https://app.onfra.xyz/icon-512.png
- **Network manifest:** https://app.onfra.xyz/.well-known/minipay-network-manifest.json
- **Support / Terms / Privacy:** `/support`, `/terms`, `/privacy`
