# Dashboard UI Spec: ChainScore AI Onchain Reputation Dashboard

Use this document as a specification and prompt for Claude (e.g., Claude 3.5 Sonnet) to build a beautiful, high-fidelity React (Vite/Next.js) or HTML/JS frontend dashboard.

---

## 1. Design Philosophy & Visual Language

*   **Aesthetics**: Sleek Web3 dark mode, glassmorphism (`backdrop-blur`), subtle glowing gradients, and clean borders.
*   **Color Palette**:
    *   *Primary/Accents*: Celo Gold (`#FBCC5C` to `#EEB22E`), Celo Green/Teal (`#35D07F` to `#12B35B`).
    *   *Backgrounds*: Deep obsidian dark (`#0A0B0D`), glass containers (`rgba(17, 18, 22, 0.7)`), borders (`rgba(255, 255, 255, 0.08)`).
    *   *Status Colors*: Low Risk/Established = Teal Green; Medium/Moderate = Celo Gold; High Risk/Volatile = Rose Red (`#EF4444`).
*   **Typography**: Premium sans-serif (e.g., *Outfit* or *Inter*).
*   **Animations**: Smooth transitions on hover, count-up animations for scores, hover expansions for card segments.

---

## 2. Page Layout & Structure

The dashboard is structured into a 3-column responsive grid layout:

```
+---------------------------------------------------------------------------------------------------+
|  [Logo] ChainScore AI                    [Wallet Selector / Address Indicator]   [Celo Price: $0.06] |
+---------------------------------------------------------------------------------------------------+
|  COLUMN 1 (Left):               |  COLUMN 2 (Center):              | COLUMN 3 (Right):            |
|  - Wallet Metadata Card         |  - Financial Health Hero         | - Connected Wallet Income    |
|  - Wallet Reputation Score Card |  - Portfolio Risk Breakdown      |   Summary (1M/2M/6M/1Y)      |
|  - Estimated Loan Capacity      |  - Income Stability & Cash Flow  |                              |
|                                 |  - Financial Growth Journey      | - Chat Section Sidebar       |
|                                 |  - AI Analysis & Actions         |   (X402 Billing integration) |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. Detailed Component Specifications

### A. Connected Wallet Header & Metadata Card
*   **Wallet Info**:
    *   Display address: `0x4821ced48fb4456055c86e42587f61c1f39c6315` (with copy button and link to CeloScan).
    *   ENS / Domain: Show "None" or fallback placeholder in small italic text.
    *   Wallet Age: `22 months` (highlighted in a gold badge).
*   **Onchain Activity Metadata**:
    *   Total Transactions on Celo: `48` (or dynamic calculation).
    *   First Transaction: `2024-07-15 05:50:08 UTC` (Tx Hash: `0xd475...94bd` with link).
    *   Last Transaction: `2026-05-29 18:56:57 UTC` (Tx Hash: `0xaa64...d073` with link).

### B. Hero Metrics
1.  **Financial Health Score Index (62%)**
    *   *UI element*: Large glowing circular progress bar with `62%` in the center.
    *   *Breakdown Sub-scores*: Accordion or tooltips showing contributing variables:
        *   Income Stability: `50 / 100`
        *   Savings Discipline: `85 / 100`
        *   Portfolio Risk: `35 / 100` (inverse ratio, higher score = lower risk)
        *   Spending Discipline: `95 / 100`
        *   Wallet Maturity: `40 / 100`
        *   Debt/Risk Signals: `90 / 100`
    *   *AI Summary Sentence*: *"Your wallet shows strong spending discipline and stablecoin retention, but high speculative asset exposure reduces your overall score."*
2.  **Wallet Reputation Score (87/100)**
    *   *UI element*: Gauge meter showing `87/100` with a badge: **"Established Wallet"** (Teal color).
    *   *Signals Indicator Icons*: Visual status checkmarks for:
        *   [✓] Wallet Age (22 months)
        *   [✓] Clean Security Profile (No scam interactions flagged)
        *   [✓] Transaction Consistency (Active DeFi user)
        *   [✓] Low Liquidation Risk (No leverage spikes)
    *   *Rationale Text*: *"This wallet demonstrates long-term legitimate activity across trusted protocols. Age of 22 months and interaction with multiple smart contracts indicates solid standing."*
3.  **Estimated Safe Loan Capacity**
    *   *UI element*: Metric display highlighting **0 USD (Ineligible)** or safe borrow limits (e.g. `$250 - $800 USD`).
    *   *Details*: Confidence Category: **Medium** (styled as orange badge).
    *   *Context*: Derived from a monthly inflow of `$4.06 USD`, consistency of `75%`, and stablecoin balance.

### C. Portfolio Risk Exposure Card
*   *UI element*: A horizontal stacked bar chart or individual circular progress widgets.
*   *Asset Split*:
    *   Stablecoin Pct: `10%`
    *   Volatile Asset Pct: `1%`
    *   DeFi Exposure: `0%`
    *   NFT Exposure: `89%` (Value: $600 USD)
*   *Risk Level Badge*: **HIGH RISK** (in pulsating red border) due to high NFT exposure relative to liquid tokens.

### D. Connected Wallet Income Summary & Celo Token Explorer (NEW)
*   *UI element*: Segmented timeline controller to toggle the timeframe: **[ 1 Month ] [ 2 Months ] [ 6 Months ] [ 1 Year ]**.
*   *Headline Stat*:
    *   Total Inbound Volume: `$XX.XX USD`
    *   Total Outbound Volume: `$XX.XX USD`
    *   Net Cash Flow: `+$X.XX USD`
*   *All-Token Income/Outgoings Grid*:
    A table/grid showing transaction volumes for Celo tokens:
    
    | Token Symbol | Token Name | Total Inflow | Total Outflow | Net Flow | USD Value |
    | :--- | :--- | :--- | :--- | :--- | :--- |
    | **CELO** | Celo Native Asset | 14.5 CELO | 10.2 CELO | +4.3 CELO | $0.26 |
    | **USDT** | Tether | 150.0 USDT | 120.0 USDT | +30.0 USDT | $30.00 |
    | **USDC** | USD Coin | 0.0 USDC | 0.0 USDC | 0.0 USDC | $0.00 |
    | **cUSD** | Celo Dollar | 20.0 cUSD | 10.0 cUSD | +10.0 cUSD | $10.00 |
    | **CKES** | Celo Kenyan Shilling | 50.0 CKES | 0.0 CKES | +50.0 CKES | $0.38 |
    | **EARN** | Earnbase Token | 9.9M EARN | 0.0 EARN | +9.9M EARN | $0.00 |

### E. Income Stability & Cash Flow Statement (Lipa Mdogo Mdogo Compliant)
*   *Activity Profile Label*: **Stable Earner** (gold glowing badge).
*   *Lipa Mdogo Mdogo Indicators*:
    *   Weekly Inflow Consistency: `75%` (visual progress bar).
    *   Estimated Monthly Inflow: `$4.06 USD`
    *   Average Inflow Size: `$0.06 USD`
    *   Recurring Patterns: `True` (Green checkmark - Stable recurring salary-like patterns detected).

### F. Financial Growth Journey
*   *UI element*: Sparkline or Area chart representing portfolio value and active transaction peaks over time. Shows peaks during inflow spikes (e.g. July 2024, May 2026).

### G. AI Analysis Summary & Action Panel
*   *Advice Panel*: Card displaying the AI advisory text: *"Your wallet demonstrates moderate financial discipline with an overall health score of 62% and reputation of 87/100..."*
*   *Actions Grid*:
    1.  **[Download Free PDF Summary]** - Styled as a primary line button.
    2.  **[Get Official Signed Attestation (0.10 USDT)]** - Styled as a premium solid gold button.
        *   *Attestation Details popup*: Shows SHA-256 Report Hash: `0x7a30...b92f`, Cryptographic attestation signature, and Celo verification endpoint.

### H. Chat Section Sidebar (ChainScore AI Chat Analyst)
*   *UI Layout*: Sliding drawer or sidebar next to the main dashboard.
*   *Conversational Interface*: Message logs with simulated chat bubble transitions.
*   *Micropayment Warning*: *"Note: Asking questions about a wallet incurs a micro-billing charge of **0.05 USDT** under the X402 standard."*
*   *Suggested Prompts*:
    *   *"Can I safely borrow 500 cUSD?"*
    *   *"Why is my portfolio categorized as High Risk?"*
    *   *"How can I increase my Reputation Score to Established?"*

---

## 4. Real Wallet Mock Data JSON

Inject this exact payload into your React state to simulate the wallet details returned by the ChainScore AI backend:

```json
{
  "walletAddress": "0x4821ced48fb4456055c86e42587f61c1f39c6315",
  "ens": null,
  "walletAgeMonths": 22,
  "celoPrice": 0.06087,
  "portfolio": {
    "stablecoinBalance": 0.5,
    "volatileBalance": 0.05,
    "defiExposure": 0,
    "nftCount": 6,
    "nftExposure": 600,
    "totalValueUsd": 600.55
  },
  "tokens": [
    {
      "address": "0x0000000000000000000000000000000000000000",
      "symbol": "CELO",
      "name": "Celo Native Asset",
      "balance": 0.7830248604190323,
      "usdValue": 0.0476627232537065,
      "isStable": false,
      "isDefi": false
    },
    {
      "address": "0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e",
      "symbol": "USDT",
      "name": "Tether",
      "balance": 0.359884,
      "usdValue": 0.359884,
      "isStable": true,
      "isDefi": false
    },
    {
      "address": "0x471ece3750da237f93b8e339c536989b8978a438",
      "symbol": "CELO",
      "name": "Celo",
      "balance": 0.7830248604190323,
      "usdValue": 0.0476627232537065,
      "isStable": false,
      "isDefi": false
    },
    {
      "address": "0xceba9300f2b948710d2653dd7b07f33a8b32118c",
      "symbol": "USDC",
      "name": "USDC",
      "balance": 0.028084,
      "usdValue": 0.028084,
      "isStable": true,
      "isDefi": false
    },
    {
      "address": "0x6f614202fa8557225dbbac16fb30fb252fec7b89",
      "symbol": "EARN",
      "name": "Earnbase Token",
      "balance": 9900000,
      "usdValue": 0,
      "isStable": false,
      "isDefi": false
    },
    {
      "address": "0x765de816845861e75a25fca122bb6898b8b1282a",
      "symbol": "CUSD",
      "name": "Celo Dollar",
      "balance": 0.07801401623238932,
      "usdValue": 0.07801401623238932,
      "isStable": true,
      "isDefi": false
    },
    {
      "address": "0x456a3d042c0dbd3db53d5489e98dfb038553b0d0",
      "symbol": "CKES",
      "name": "Celo Kenyan Shilling",
      "balance": 4.333174620559881,
      "usdValue": 0.0329321271162551,
      "isStable": true,
      "isDefi": false
    }
  ],
  "firstTransaction": {
    "hash": "0xd4752aa1fde1f9584ab802a000b94ecde313a38044b3978ae45bd5a85de94bd3",
    "timestamp": "2024-07-15T05:50:08.000Z",
    "type": "inflow",
    "amountUsd": 0.06,
    "token": "CELO"
  },
  "lastTransaction": {
    "hash": "0xaa647c82e0cc8f43f639672c58b5f246219bdb28b27ac793e8e87181f959d073",
    "timestamp": "2026-05-29T18:56:57.000Z",
    "type": "outflow",
    "amountUsd": 0,
    "token": "CELO"
  },
  "metrics": {
    "financialHealth": {
      "score": 62,
      "breakdown": {
        "incomeStability": 50,
        "savingsDiscipline": 85,
        "portfolioRisk": 35,
        "spendingDiscipline": 95,
        "walletMaturity": 40,
        "debtRiskSignals": 90
      }
    },
    "reputation": {
      "score": 87,
      "category": "Established Wallet",
      "rationale": "This wallet demonstrates long-term legitimate activity across trusted protocols. Age of 22 months and interaction with multiple smart contracts indicates solid standing."
    },
    "risk": {
      "category": "High",
      "allocation": {
        "stablecoin": 10,
        "volatile": 1,
        "defi": 0,
        "nft": 89
      }
    },
    "incomeProfile": {
      "label": "Stable Earner",
      "monthlyEstimateUsd": 4.06,
      "weeklyConsistency": 75,
      "averageInflowUsd": 0.06,
      "recurringSenderPatterns": true
    },
    "loanCapacity": {
      "range": "0 USD (Ineligible)",
      "minLoanUsd": 0,
      "maxLoanUsd": 0,
      "confidence": "Medium"
    }
  },
  "attestation": {
    "hash": "0x7a30ef182a4729cb251d8b92fd2381f9c8fcd918374d89b1c7a8efb472e3914a",
    "paragraph": "This document serves as an official financial attestation generated by ChainScore AI. Wallet address 0x4821ced48fb4456055c86e42587f61c1f39c6315 shows a weighted Financial Health Index of 62% and a Trust Reputation Score of 87/100. Over the analyzed history, the wallet demonstrates recurring Stable Earner dynamics with average monthly inflows of $4.06 USD and significant exposure to volatile assets and active trading behavior. The estimated borrowing capacity is certified within the range of 0 USD (Ineligible)."
  }
}
```
