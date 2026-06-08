# Wallet Profile AI — Agent Codebase

This folder contains the complete, production-ready LangChain agentic system built in TypeScript (Node.js) to power the wallet reputation analysis dashboard, chat section, and premium report generation.

---

## 1. Project Structure

The project is modularized into tools, middleware, memory cache, prompts, and chains:

```
/agent
  ├── tsconfig.json          # TypeScript compilation configuration
  ├── package.json           # Scripts, LangChain and Google dependencies
  ├── main.ts                # Application entrypoint / verification suite
  │
  ├── prompts/
  │   ├── system_prompt.ts   # System rules defining Wallet Profile AI Persona
  │   ├── summary_prompt.ts  # Templates for Dashboard and Attestation summaries
  │   └── report_prompt.ts   # Templates for formal lender commentary
  │
  ├── tools/
  │   ├── fetch_onchain_data.ts        # Simulates wallet activity ingestion
  │   ├── compute_financial_health.ts  # Weights scores (Income, Savings, Portfolio Risk, etc.)
  │   ├── compute_reputation_score.ts  # Analyzes security flags and protocol trust
  │   ├── risk_exposure.ts             # Computes Stablecoin/Volatile asset split
  │   ├── income_stability.ts          # Checks inflow consistency and weekly frequency
  │   ├── loan_capacity.ts             # Formulates safe borrow limits (USD)
  │   ├── report_compiler.ts           # Compiles sections and hashes metrics for attestation
  │   └── pdf_renderer.ts              # Renders a formatted text-PDF file in reports/
  │
  ├── middleware/
  │   └── x402_billing.ts    # Micropayments gating middleware (0.05 / 0.10 USDT fees)
  │
  ├── memory/
  │   └── wallet_cache.ts    # Block height-aware wallet cache (15-min TTL)
  │
  └── chains/
      ├── analysis_chain.ts  # Sequential pipeline for initial dashboard populate
      ├── chat_agent.ts      # ReAct agent loop for free-form conversation
      └── report_chain.ts    # Official PDF compiler gated by X402 micropayments
```

---

## 2. Key Architectural Flows

### A. Wallet Analysis Chain (Dashboard)
Runs sequentially when a wallet connects to populate the dashboard.
- Checks `wallet_cache` first.
- If missed, runs `fetch_onchain_data` $\rightarrow$ `compute_financial_health` $\rightarrow$ `compute_reputation_score` $\rightarrow$ `risk_exposure` $\rightarrow$ `income_stability` $\rightarrow$ `loan_capacity`.
- Passes the metric profiles to the Google Gemini model using the `SUMMARY_PROMPT` to generate friendly summaries and structured formal attestation paragraphs.
- Writes the compiled result to cache.

### B. Chat Agent (Multi-turn Conversational AI)
Powers the interactive chat interface, allowing users to ask queries about their wallet or third-party addresses.
- Instantiates a ReAct agent using `ChatGoogle` and the tool list.
- Every tool is wrapped in the **X402 Billing Middleware** $\rightarrow$ when the LLM decides to call a tool, a charge is verified and deducted.
- Maintains short-term conversational context.

### C. Premium PDF Report Generation
Executes when a user purchases the official signed attestation.
- Deducts a one-time fee of **0.10 USDT** from the user's wallet.
- Triggers the Wallet Analysis Chain to get raw and computed metrics.
- Uses `report_compiler` to calculate a cryptographic `SHA-256` report hash (acting as the verification attestation signature).
- Uses `pdf_renderer` to compile and save the report as a downloadable file under `reports/REP-<ID>.txt`.

---

## 3. X402 Billing & Micropayment System
The microbilling is integrated via `agent/middleware/x402_billing.ts`.
- **Micropayment Gate**: Every wallet-based analysis tool is wrapped using the `wrapWithX402(toolInstance, chargeUsdt)` helper.
- **Deduction Flow**:
  1. Checks if the current user wallet has a balance $\ge$ cost.
  2. If sufficient, deducts the charge and logs remaining balance.
  3. If insufficient, throws `InsufficientBalanceError` and aborts tool invocation with a message: `"Insufficient balance. Tool X costs Y USDT. Your balance is Z USDT. Please top up."`
- **Pricing**:
  - Wallet query: **0.05 USDT**
  - Premium Report: **0.10 USDT**

---

## 4. Getting Started & Configuration

### Prerequisites
Make sure Node.js ($\ge$ 20) is installed.

### Installation
Install dependencies inside the `/agent` directory:
```bash
npm install
```

### Environment Variables
Optionally set your Google Gemini API key:
```bash
export GOOGLE_API_KEY="your_api_key_here"
```
*(If no API key is provided, the codebase falls back to a deterministic rule-based AI generator and mock chat simulator so that the app remains fully testable offline).*

### Execution
Run the verification test suite containing analysis, billing checks, and failure recovery:
```bash
npm run dev
```
To compile TypeScript:
```bash
npm run build
```
