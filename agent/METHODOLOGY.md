# Wallet Profile AI — Scoring & Reputation Methodology

This document provides a detailed breakdown of the mathematical formulas, rules, weights, and logic used by the Wallet Profile AI agent to calculate a wallet's financial profile. These metrics form the basis of the user dashboard, the conversational chat agent, and the premium attestation reports.

---

## 1. Reputation Score (`compute_reputation_score.ts`)

The **Reputation Score** assesses the trustworthiness and history of a wallet. It is a value between `0` and `100` calculated by adding bonuses to a base score and subtracting security-related penalties.

### Mathematical Formula

$$\text{Reputation Score} = \max\Big(0, \min\big(100, \text{Base} + \text{AgeBonus} + \text{ProtocolBonus} + \text{ConsistencyBonus} - \text{Penalties}\big)\Big)$$

Where:
*   **Base Score**: Starts at `50` points.
*   **Age Bonus**: `+1` point per month of wallet age, up to a maximum of `30` points (capped at `walletAgeMonths = 30`).
*   **Protocol Bonus**: `+5` points per unique trusted protocol interacted with, up to a maximum of `15` points (capped at `protocols.length = 3`).
*   **Consistency Bonus**: Determined by the total number of transactions (`txCount`) over the past 3 months:
    *   `txCount > 20`: `+10` points
    *   `txCount > 10`: `+5` points
    *   `txCount <= 10`: `+0` points

### Penalties
Security-related penalties are deducted based on wallet address properties (used as mock security flags for liquidation or bad contract history):
*   **Suspicious Protocol Interaction Penalty**: `-25` points if the lowercase wallet address contains `"bad"` or ends with `"0"` (indicates interaction with unverified contracts).
*   **Arbitrage / Liquidation Risk Penalty**: `-15` points if the lowercase wallet address contains `"dead"` or ends with `"99"` (indicates a flashloan arbitrage or liquidation-prone profile).

### Trust Category Classification

Based on the final score, wallets are categorized into one of four trust levels:

| Score Range | Category | Description |
| :--- | :--- | :--- |
| **$\ge$ 85** | **Established Wallet** | High age, consistent activity, and robust protocol interaction. |
| **70 – 84** | **Trusted DeFi User** | Consistent usage pattern across multiple protocols with clean history. |
| **50 – 69** | **Moderate Reputation Wallet** | Standard wallet with moderate history or limited protocol exposure. |
| **< 50** | **High Risk / Unverified Wallet** | Flagged address, very low age, or suspicious protocol interaction. |

---

## 2. Risk Exposure (`risk_exposure.ts`)

The **Risk Exposure** module calculates the distribution of a wallet's assets and assigns a risk category. 

### Portfolio Breakdown

The total portfolio value is the sum of all assets:

$$\text{Total Portfolio} = \text{Stablecoin Balance} + \text{Volatile Asset Balance} + \text{DeFi Exposure} + \text{NFT Exposure}$$

The percentage for each asset type is computed and rounded to the nearest integer:

*   **Stablecoin Pct**: $\text{round}\left(\frac{\text{Stablecoin Balance}}{\text{Total Portfolio}} \times 100\right)$ *(defaults to $100\%$ if portfolio is $0$)*
*   **Volatile Asset Pct**: $\text{round}\left(\frac{\text{Volatile Asset Balance}}{\text{Total Portfolio}} \times 100\right)$
*   **DeFi Exposure Pct**: $\text{round}\left(\frac{\text{DeFi Exposure}}{\text{Total Portfolio}} \times 100\right)$
*   **NFT Exposure Pct**: $\text{round}\left(\frac{\text{NFT Exposure}}{\text{Total Portfolio}} \times 100\right)$

### Risk Classification

The wallet is assigned one of three risk categories:

*   **Low Risk**: Assigned if the stablecoin percentage is **$\ge$ 70%**.
*   **High Risk**: Assigned if the volatile asset percentage is **> 60%** OR the NFT exposure percentage is **> 30%**.
*   **Medium Risk**: Assigned by default if the wallet does not trigger the Low or High risk conditions.

---

## 3. Income Stability (`income_stability.ts`)

The **Income Stability** analysis filters wallet transactions to isolate all incoming funds (`type === "inflow"`) and analyzes their frequency, size, and source consistency.

### Default State (Dormant / Empty)
If a wallet has `0` inflows, the module returns:
*   `incomeLabel`: `"Dormant Wallet"`
*   `weeklyInflowConsistency`: `0%`
*   `monthlyIncomeEstimateUsd`: `0`
*   `averageInflowSizeUsd`: `0`
*   `recurringSenderPatterns`: `false`

### Metric Calculations

For wallets with inflows ($n > 0$):

1.  **Average Inflow Size (USD)**:
    $$\text{Average Inflow Size} = \text{round}\left(\frac{\sum \text{Inflow Amounts}}{\text{Number of Inflows}}, 2\right)$$
2.  **Date Range Calculation**:
    $$\text{Range Days} = \max\left(1, \frac{\text{Timestamp of Last Inflow} - \text{Timestamp of First Inflow}}{1000 \times 60 \times 60 \times 24}\right)$$
    $$\text{Range Months} = \max\left(1, \frac{\text{Range Days}}{30}\right)$$
    $$\text{Range Weeks} = \max\left(1, \frac{\text{Range Days}}{7}\right)$$
3.  **Monthly Income Estimate (USD)**:
    $$\text{Monthly Income Estimate} = \text{round}\left(\frac{\sum \text{Inflow Amounts}}{\text{Range Months}}, 2\right)$$
4.  **Weekly Inflow Consistency**:
    Inflows are grouped into weekly bins using the identifier `YYYY-WeekNumber` (e.g., `2026-22`).
    $$\text{Weekly Inflow Consistency (\%)} = \min\left(100, \text{round}\left(\frac{\text{Unique Weeks with } \ge 1 \text{ Inflow}}{\lceil \text{Range Weeks} \rceil} \times 100\right)\right)$$
5.  **Recurring Sender Patterns**:
    Inflow USD amounts are rounded to the nearest $10. If the most frequent rounded amount appears $\ge 3$ times, and the total inflow count is $> 5$, `recurringSenderPatterns` is flagged as `true`.

### Income Label Classification

Wallets are classified into one of the following activity categories:

1.  **Whale Activity**: Total balance (stablecoins + volatile assets) is **> $100,000** OR the average inflow size is **> $15,000**.
2.  **Stable Earner**: Not a whale, and weekly inflow consistency is **$\ge$ 75%**.
3.  **Growing Wallet / Seasonal Earner**: Not a whale or stable earner, has $\ge 3$ months of history, and $\ge 6$ inflows:
    *   The inflows are split chronologically into two halves.
    *   If the average inflow size of the second half (`secondAvg`) is **> 1.2x** the average of the first half (`firstAvg`), it is labeled a **Growing Wallet**.
    *   Otherwise, it is labeled a **Seasonal Earner**.
4.  **Dormant Wallet**: Wallet history spans **> 90 days** and has **$\le$ 2** total inflows.
5.  **Volatile Income**: Assigned as the default fallback category.

---

## 4. Loan Capacity (`loan_capacity.ts`)

The **Loan Capacity** estimator determines a safe borrowing limit in USD by synthesizing income stability, portfolio risk, and asset balances.

### Calculation Steps

1.  **Base Borrowing Capacity**: Set to 30% of the estimated monthly inflow.
    $$\text{Base Capacity} = \text{Monthly Income Estimate} \times 0.3$$
2.  **Consistency Multiplier**: Adjusts the capacity based on weekly consistency, scaling capacity by a factor between `0.5x` (0% consistency) and `1.0x` (100% consistency).
    $$\text{Consistency Multiplier} = 0.5 + \left(0.5 \times \frac{\text{Weekly Inflow Consistency}}{100}\right)$$
    $$\text{Base Capacity} \leftarrow \text{Base Capacity} \times \text{Consistency Multiplier}$$
3.  **Risk Multiplier**: Adjusts capacity based on portfolio risk category:
    *   `Low` risk: `1.2x` multiplier
    *   `Medium` risk: `0.8x` multiplier
    *   `High` risk: `0.4x` multiplier
    $$\text{Base Capacity} \leftarrow \text{Base Capacity} \times \text{Risk Multiplier}$$
4.  **Balance Booster**: Adds a cushion equivalent to 10% of the stablecoin balance.
    $$\text{Base Capacity} \leftarrow \text{Base Capacity} + (\text{Stablecoin Balance} \times 0.1)$$
5.  **Safe Loan Range**:
    *   `Capacity` = $\max(0, \text{round}(\text{Base Capacity}))$
    *   **Min Loan**: $\text{round}(\text{Capacity} \times 0.7)$
    *   **Max Loan**: $\text{round}(\text{Capacity} \times 1.3)$
    *   If max loan is $0$, the wallet is marked as `"0 USD (Ineligible)"`. Otherwise, range is formatted as `"{Min Loan}-{Max Loan} USD"`.

### Confidence Level mapping
The confidence in the estimate is determined by wallet age and consistency:
*   **High Confidence**: Wallet age is **> 24 months** and weekly consistency is **> 80%**.
*   **Low Confidence**: Wallet age is **< 6 months** OR weekly consistency is **< 40%**.
*   **Medium Confidence**: Default classification.

---

## 5. Financial Health Score (`compute_financial_health.ts`)

The overall **Financial Health Score** is a weighted index (from `0` to `100`) computed from six sub-scores that analyze income, savings habits, asset choices, spending patterns, protocol maturity, and debt signals.

### Health Index Components

1.  **Income Stability Sub-Score** (0-100):
    *   `0` inflows: `10` points.
    *   `1` inflow: `30` points.
    *   `>1` inflows: Measures the intervals (in days) between consecutive inflows. Let $\mu$ be the average interval and $\sigma$ be the standard deviation of intervals. The consistency ratio is defined as:
        $$\text{Consistency Ratio} = \frac{\sigma}{\max(1, \mu)}$$
        *   $\text{Consistency Ratio} < 0.2 \implies \mathbf{95}$ points
        *   $\text{Consistency Ratio} < 0.5 \implies \mathbf{80}$ points
        *   $\text{Consistency Ratio} < 1.0 \implies \mathbf{60}$ points
        *   $\text{Consistency Ratio} \ge 1.0 \implies \mathbf{40}$ points
2.  **Savings Discipline Sub-Score** (0-100):
    *   If total balance is $0$: `10` points.
    *   Otherwise, let $\text{Stable Ratio} = \frac{\text{Stablecoin Balance}}{\text{Total Balance}}$:
        $$\text{Savings Discipline} = \min\left(100, \text{round}\left(\text{Stable Ratio} \times 70 + \min\left(30, \frac{\text{Total Balance}}{200}\right)\right)\right)$$
3.  **Portfolio Risk Sub-Score** (0-100):
    Measures the ratio of volatile assets:
    $$\text{Portfolio Risk} = \text{round}\left(\left(1 - \frac{\text{Volatile Balance}}{\text{Total Balance}}\right) \times 100\right)$$
    *(A higher score indicates lower risk exposure; i.e., $100$ means all assets are stablecoins)*
4.  **Spending Discipline Sub-Score** (0-100):
    Analyzes the ratio of outflow volume to inflow volume:
    $$\text{Outflow Ratio} = \frac{\text{Total Outflow (USD)}}{\text{Total Inflow (USD)}}$$
    *   If total inflow is $0$: Defaults to `50` points.
    *   If $\text{Outflow Ratio} \le 0.3 \implies \mathbf{95}$ points (Excellent savings rate)
    *   If $\text{Outflow Ratio} \le 0.6 \implies \mathbf{85}$ points (Good savings rate)
    *   If $\text{Outflow Ratio} \le 0.9 \implies \mathbf{70}$ points (Moderate savings rate)
    *   If $\text{Outflow Ratio} \le 1.1 \implies \mathbf{50}$ points (Neutral/Break-even)
    *   If $\text{Outflow Ratio} > 1.1 \implies \max\left(10, \text{round}(100 - (\text{Outflow Ratio} \times 30))\right)$ (Deficit spending)
5.  **Wallet Maturity Sub-Score** (0-100):
    Combines the age of the wallet and active protocol usage:
    *   **Age Component**: $\min\left(60, \frac{\text{Wallet Age Months}}{48} \times 60\right)$ (reaches max at 4 years)
    *   **Protocol Component**: $\min(40, \text{protocols.length} \times 10)$ (reaches max at 4 protocols)
    *   $$\text{Wallet Maturity} = \text{round}(\text{Age Component} + \text{Protocol Component})$$
6.  **Debt / Risk Signals Sub-Score** (0-100):
    *   Starts at `100` points.
    *   If volatile ratio is **> 80%**: Subtract `20` points.
    *   If Aave is present in the wallet's protocols: Subtract `10` points (indicates active borrowing/debt exposure).

### Weights & Weighted Health Score

The six sub-scores are aggregated using the following weights:

| Sub-Score | Weight | Key Metric Analyzed |
| :--- | :---: | :--- |
| **Income Stability** | **25%** | Variance and predictability of inflows |
| **Savings Discipline** | **20%** | Absolute stablecoin ratios and balance size cushions |
| **Portfolio Risk** | **20%** | Stable vs volatile asset allocation |
| **Spending Discipline** | **15%** | Outflow to inflow ratios |
| **Wallet Maturity** | **10%** | Wallet lifespan and smart contract integrations |
| **Debt / Risk Signals** | **10%** | Liquid asset coverage and lending protocol exposure |

$$\text{Financial Health Score} = \text{round}\Big(0.25 \cdot \text{IS} + 0.20 \cdot \text{SD} + 0.20 \cdot \text{PR} + 0.15 \cdot \text{SpD} + 0.10 \cdot \text{WM} + 0.10 \cdot \text{DRS}\Big)$$
