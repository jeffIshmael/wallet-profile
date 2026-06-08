# LangChain Integration — Onchain Financial Reputation Agent

This document explains how LangChain is used to power the AI agents behind the analysis dashboard, the chat section, and the full report generation.

---

## Overview

The platform has two distinct agent surfaces that use LangChain:

1. **The Analysis Agent** — runs automatically when a wallet is connected. Fetches onchain data, computes scores, and populates the dashboard.
2. **The Chat Agent** — responds to user queries about their own wallet or any other wallet address, with X402 metered billing per question.

Both agents share the same underlying LangChain toolset but differ in how they're invoked and what they output.

---

## Stack

| Layer | Technology |
|---|---|
| Agent Framework | LangChain (Python or TypeScript) |
| LLM | Claude (via Anthropic API) or GPT-4 |
| Onchain Data | Moralis / Covalent / The Graph / Alchemy |
| Stablecoin/Price Data | CoinGecko API |
| Vector Memory | Pinecone or ChromaDB (for wallet history context) |
| X402 Billing | Custom LangChain middleware / tool wrapper |
| PDF Generation | ReportLab (Python) or Puppeteer (Node) |
| Output Format | Structured JSON → Dashboard / PDF |

---

## 1. Wallet Analysis Agent

This agent is triggered when the user connects their wallet. It is a **sequential chain** that runs a series of tools and assembles a structured report object.

### Flow

```
Wallet Address
      ↓
[Tool: Fetch Onchain Data]
      ↓
[Tool: Compute Financial Health Score]
      ↓
[Tool: Compute Reputation Score]
      ↓
[Tool: Risk Exposure Breakdown]
      ↓
[Tool: Income Stability Analysis]
      ↓
[Tool: Loan Capacity Estimator]
      ↓
[LLM: Generate AI Summary]
      ↓
Structured Dashboard JSON
```

### LangChain Chain Type

Use `SequentialChain` or LangChain Expression Language (LCEL) pipeline:

```python
from langchain.chains import SequentialChain

wallet_analysis_chain = (
    fetch_onchain_data_tool
    | compute_financial_health
    | compute_reputation_score
    | risk_exposure_breakdown
    | income_stability_analysis
    | loan_capacity_estimator
    | ai_summary_generator
)
```

### Tools Defined

#### `fetch_onchain_data`
- Calls Blockscout / RPC with the wallet address.
- Returns: basic token balances, protocol interactions, wallet age, ENS, firstTransaction, and lastTransaction. This tool is optimized to be fast and does not retrieve full transaction history.

```python
@tool
def fetch_onchain_data(wallet_address: str) -> dict:
    """Fetches raw onchain overview metadata for a wallet (no full transactions list)."""
    # Return structured dict: { balances, protocols, age, ens, firstTransaction, lastTransaction }
```

#### `fetch_wallet_transactions`
- Fetches recent transaction statement for a wallet on Celo for a custom timeframe (months = 1, 3, 6, or 12).
- Returns: transaction count, timeframe inflow/outflow/net flow details, and a truncated recent transaction list.

```python
@tool
def fetch_wallet_transactions(wallet_address: str, months: int = 3) -> dict:
    """Fetches a cash flow statement for a wallet over a specified number of months."""
    # Return structured dict: { transactionCount, timeframeMonths, threeMonthInflowUsd, threeMonthOutflowUsd, threeMonthNetFlowUsd, transactions }
```

#### `compute_financial_health`
- Takes raw onchain data.
- Scores each sub-dimension (Income Stability, Savings Discipline, Portfolio Risk, Spending Discipline, Wallet Maturity, Debt/Risk Signals).
- Weights them into a single Financial Health % score.

```python
@tool
def compute_financial_health(onchain_data: dict) -> dict:
    """
    Scores:
    - income_stability: 0-100
    - savings_discipline: 0-100
    - portfolio_risk: 0-100 (inverse — lower risk = higher score)
    - spending_discipline: 0-100
    - wallet_maturity: 0-100
    - debt_risk_signals: 0-100 (inverse)

    Returns overall financial_health_score and per-dimension breakdown.
    """
```

Weights (configurable):
```
income_stability      → 25%
savings_discipline    → 20%
portfolio_risk        → 20%
spending_discipline   → 15%
wallet_maturity       → 10%
debt_risk_signals     → 10%
```

#### `compute_reputation_score`
- Separate from financial health.
- Examines wallet age, scam interactions, suspicious drains, transaction consistency, repayment patterns, protocol credibility.
- Returns a Reputation Score (0–100).

#### `risk_exposure_breakdown`
- Classifies portfolio into: Stablecoin %, Volatile Asset %, DeFi Exposure %, NFT Exposure %.
- Assigns overall risk category: Low / Medium / High.

#### `income_stability_analysis`
- Analyses inflow frequency, size, and recurrence.
- Assigns a fun label: `Stable Earner`, `Growing Wallet`, `Seasonal Earner`, `Volatile Income`, `Whale Activity`, or `Dormant Wallet`.
- Returns weekly inflow consistency, monthly income estimate, average inflow size, recurring sender patterns.

#### `loan_capacity_estimator`
- Uses: average monthly inflow, consistency score, wallet balance retention, volatility exposure.
- Returns an estimated safe loan range in USD.

#### `ai_summary_generator`
- This is the only step that calls the LLM directly.
- Receives all computed scores and metrics as context.
- Generates a short, friendly AI summary for the dashboard and a more detailed paragraph for the full report.

```python
summary_prompt = ChatPromptTemplate.from_template("""
You are a financial analyst reviewing an onchain wallet.

Wallet Metrics:
- Financial Health Score: {financial_health_score}%
- Reputation Score: {reputation_score}/100
- Risk Category: {risk_category}
- Income Label: {income_label}
- Estimated Monthly Inflow: {monthly_inflow} USD
- Estimated Safe Loan Range: {loan_range}
- Sub-scores: {sub_scores}

Write:
1. A short dashboard summary (2–3 sentences, friendly tone).
2. A formal financial attestation paragraph (for the full PDF report).
""")
```

---

## 2. Chat Agent

The Chat Agent is a **ReAct agent** (Reasoning + Acting) that can answer free-form questions about any wallet. It reuses the same tools as the Analysis Agent but calls them on-demand based on the user's question.

### LangChain Agent Type

Use `create_react_agent` or `AgentExecutor`:

```python
from langchain.agents import create_react_agent, AgentExecutor

agent = create_react_agent(
    llm=llm,
    tools=[
        fetch_onchain_data,
        compute_financial_health,
        compute_reputation_score,
        risk_exposure_breakdown,
        income_stability_analysis,
        loan_capacity_estimator,
    ],
    prompt=chat_agent_prompt,
)

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

### X402 Billing Middleware

Every tool call that touches a wallet is wrapped in an X402 billing check. This is implemented as a LangChain **tool wrapper** (decorator) that:

1. Checks if the user has sufficient balance.
2. Deducts the charge before executing the tool.
3. Rejects the call with a friendly message if balance is insufficient.

```python
def x402_gated(charge_usdt: float):
    """Decorator that gates a LangChain tool behind an X402 micropayment."""
    def decorator(tool_fn):
        @wraps(tool_fn)
        def wrapper(*args, **kwargs):
            wallet = get_current_user_wallet()
            if not x402_deduct(wallet, charge_usdt):
                raise InsufficientBalanceError(
                    f"This action costs {charge_usdt} USDT. Please top up."
                )
            return tool_fn(*args, **kwargs)
        return wrapper
    return decorator

# Applied to tools:
@tool
@x402_gated(charge_usdt=0.05)
def fetch_onchain_data(wallet_address: str) -> dict:
    ...
```

Charges:
- Any wallet query → **0.05 USDT**
- Full report generation → **0.1 USDT**

### Example Chat Interactions

| User Question | Agent Behaviour |
|---|---|
| "Can I safely spend 15k?" | Fetches user's own wallet data → checks loan capacity + balance → answers |
| "Why did my score drop?" | Re-analyses wallet → compares current vs cached scores → explains delta |
| "What's hurting my financial health?" | Runs financial health tool → surfaces the lowest sub-dimension scores |
| "Can I trust 0x123...?" | Fetches the target wallet → runs reputation score → summarises |
| "What's the financial health for 0x456...?" | Runs full analysis on the queried wallet → returns dashboard-style summary |

---

## 3. Full Report Generation Chain

When the user pays 0.1 USDT and requests the full report, a dedicated chain runs:

```
Wallet Address
      ↓
[Run Full Analysis Chain (if not cached)]
      ↓
[Tool: Compile Report Sections]
        - Identity Block
        - Financial Summary
        - Financial Health (with explanations)
        - Income Analysis
        - Loan Suitability
        - Risk Assessment
        - AI Financial Summary
        - Verification & Attestation Block
      ↓
[Tool: Generate Report Hash + Attestation]
      ↓
[Tool: Render PDF]
      ↓
Signed PDF download
```

The report hash and ERC-804 attestation are appended at the end, making it verifiable on-chain.

---

## 4. Memory & Context

### Short-term (Conversation Memory)
For the Chat Agent, use `ConversationBufferWindowMemory` to maintain context across multi-turn conversations:

```python
from langchain.memory import ConversationBufferWindowMemory

memory = ConversationBufferWindowMemory(k=10, return_messages=True)
```

### Long-term (Wallet Cache)
Computed wallet scores are cached in a vector store (Pinecone / ChromaDB) keyed by wallet address + block height. This avoids re-fetching onchain data on every question and reduces API costs.

```python
# Cache key pattern
cache_key = f"{wallet_address}:{latest_block_height}"
```

Cache TTL: **15 minutes** (onchain data changes slowly enough).

---

## 5. Agent Prompt Design

The system prompt for both agents emphasises that the LLM should:

- Always ground its answers in the computed metrics (no hallucinated scores).
- Use friendly, accessible language for dashboard summaries.
- Use formal, institutional language for the full PDF report.
- Never reveal raw tool outputs directly — always interpret them.

```python
SYSTEM_PROMPT = """
You are ChainScore AI, an onchain financial reputation analyst.

Your job is to help users understand their wallet's financial health, reputation, and risk profile using real onchain data.

Rules:
- Always base your answers on the tool outputs. Never guess or hallucinate scores.
- For dashboard summaries: be friendly, encouraging, and concise.
- For full report sections: be formal, precise, and institutional.
- When a user asks about improving their score, give actionable onchain advice.
- If a wallet shows suspicious patterns, flag it clearly but without alarmism.
"""
```

---

## 6. Project Structure

```
/agent
  tools/
    fetch_onchain_data.py
    compute_financial_health.py
    compute_reputation_score.py
    risk_exposure.py
    income_stability.py
    loan_capacity.py
    report_compiler.py
    pdf_renderer.py
  chains/
    analysis_chain.py       # SequentialChain for dashboard
    chat_agent.py           # ReAct AgentExecutor for chat
    report_chain.py         # Full report generation
  middleware/
    x402_billing.py         # X402 micropayment gate
  memory/
    wallet_cache.py         # Vector store cache
  prompts/
    system_prompt.py
    summary_prompt.py
    report_prompt.py
  main.py
```

---

## 7. Key Design Decisions

**Why ReAct for the Chat Agent?**
The chat agent needs to reason about *which* tools to call based on the question. A ReAct agent lets the LLM decide: "To answer this question I need the reputation score, not the full analysis." This keeps costs low and responses fast.

**Why Sequential Chain for the Dashboard?**
The dashboard always needs all metrics populated. A sequential chain guarantees every tool runs in the right order with no skipped steps.

**Why cache at the vector store level?**
Fetching full transaction history on every message would be slow and expensive. Caching the computed scores means the chat agent can answer follow-up questions instantly after the first analysis.

**Why separate Financial Health from Reputation Score?**
A wallet can have healthy income patterns but still interact with scam contracts (bad reputation). Keeping them separate makes both scores more meaningful and more useful to lenders and DAOs reviewing the report.
