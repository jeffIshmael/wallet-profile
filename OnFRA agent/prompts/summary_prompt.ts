import { ChatPromptTemplate } from "@langchain/core/prompts";

export const SUMMARY_PROMPT = ChatPromptTemplate.fromTemplate(`You are a financial analyst reviewing an onchain wallet.

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
2. A formal financial attestation paragraph (for the full PDF report).`);
