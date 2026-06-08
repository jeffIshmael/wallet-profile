# The Agentic System
- The orcherstration layer is Langchain.
- For this to work effectively, we are going to have the following different agents working together:-

## 1. Financial Orchestrator Agent (MAIN BRAIN)
- This is the primary LangChain agent.
- It:
    - receives user prompts,
    - determines intent,
    - routes tasks,
    - combines outputs,
    - generates final responses.

Example:-
    User:
      “Can I safely take a 40k loan?”
    The orchestrator:
        fetches wallet activity,
        computes inflows,
        checks volatility,
        computes score,
        generates reasoning,
        returns AI response.
        Responsibilities
        intent classification
        tool routing
        memory/context
        response generation
        agent coordination

## 2. Wallet Activity Agent
- This is your blockchain ingestion layer.
- Responsibilities:-
    Fetch:
        - wallet balances,
        - transfers,
        - swaps,
        - protocol interactions,
        - NFT activity,
        - stablecoin history.
        - Input
        - walletAddress
        - chains[]
        - timeRange
    Output:
        Structured transaction data.

- Possible APIs:-
    - Covalent
    - Alchemy
    - Goldsky
    - Blockscout
    - RPC reads

## 3. Portfolio Intelligence Agent
- Transforms raw wallet data into:
- understandable financial metrics.
- Responsibilities:-
    Compute:
        - total inflow,
        - total outflow,
        - monthly averages,
        - active chains,
        - stablecoin ratios,
        - portfolio diversity,
        - protocol usage.

Example Output:-
{
  "monthlyIncomeEstimate": 540,
  "stablecoinRatio": 74,
  "walletAgeMonths": 19,
  "activityLevel": "High"
}

## 4. Financial Health Agent
- This is one of the MOST important agents.
- Responsibilities
    Compute:
        - Financial Health Score
        - Stability Score
        - Savings Discipline
        - Spending Discipline
        - Wallet Maturity

Example:
“The wallet demonstrates healthy stablecoin retention but excessive short-term outflows reduce financial stability.”

## 5. Reputation Scoring Agent
- This measures trustworthiness.
- Responsibilities
    Analyze:
        - suspicious activity,
        - scam interactions,
        - transaction consistency,
        - wallet maturity,
        - liquidation exposure,
        - protocol credibility.
Outputs
{
  "reputationScore": 88,
  "riskLevel": "Low",
  "trustCategory": "Established Wallet"
}

## 6. Loan Capacity Agent
- Responsibilities:-
    Estimate:
        - safe borrowing range,
        - repayment capability,
        - income consistency.
Example Output
{
  "safeLoanEstimate": "200-600 USD",
  "confidence": "Medium"
}

## 8. Financial Insight Agent
- This is the personality layer.
- Responsibilities:-
    Convert raw metrics into:
        - observations,
        - advice,
        - summaries,
        - warnings.

Example Outputs:-
    “Your stablecoin reserves have increased 22% this month.”
    “Your wallet shows unusually volatile activity.”
    “You maintain strong monthly inflows but retain very little balance.”

- Make users feel understood.

## 9. PDF Generation Agent
Has two Modes:-

### 1. Free PDF
- Dashboard snapshot.
### 2. Premium Financial Report
- Paid via x402.

- Responsibilities
    Generate:
        - beautiful layouts,
        - lender-ready reports,
        - wallet attestations,
        - downloadable PDFs.
### 10. Wallet Query Agent
- This handles public wallet analysis.
- Responsibilities:-
    - analyze third-party wallets,
    - return summaries,
    - gate via x402 payment.
Example
    User:
      “Analyze 0x123…”
    Agent:
        checks payment,
        fetches wallet,
        computes scores,
        returns insights.
11. x402 Payment Agent
This is EXTREMELY important for hackathon alignment.
Responsibilities
Handle:
pay-per-query,
report purchases,
payment verification.
Pricing
Wallet query
0.05 USDT
Full report
0.1 USDT
This structure is PERFECT.