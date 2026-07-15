import Link from "next/link";
import {
  DocsBreadcrumb,
  DocsCode,
  DocsH2,
  DocsH3
} from "@/components/docs/DocsContent";
import { DocsShell } from "@/components/docs/DocsShell";
import { API_URL, APP_URL } from "@/lib/links";
import type { TocItem } from "@/lib/docsNav";

const TOC: TocItem[] = [
  { id: "why", title: "Why lenders use OnFRA" },
  { id: "flow", title: "Integration flow" },
  { id: "screen", title: "Screen endpoint" },
  { id: "response", title: "Response fields" },
  { id: "passport", title: "REP passport" }
];

export default function LendersDocsPage() {
  return (
    
      
      # Lender screening
      
        Screen borrower wallets before extending credit. One API call returns an underwriting
        data package you can use to evaluate trustworthiness, financial health, estimated monthly income,
        and estimated loan capacity.
      

      
        ## Why lenders use OnFRA
        
          On Celo, underwriting often relies on collateral and balances. What&apos;s missing for MiniPay
          earners and stablecoin freelancers is **proof of income** from onchain activity.
          OnFRA fills that gap with:
        

        
          - Recurring stablecoin inflow patterns and weekly consistency

          - Wallet reputation score (0–100) from maturity and behavior

          - Estimated loan capacity range with confidence level

          - Trustworthiness flag derived from onchain financial signals

        

        ## Integration flow
        
          - Borrower provides wallet address (and optionally a REP passport ID)

          - Your backend calls `POST /api/lender/screen` with x402 payment **(0.01 USDT)**

          - Use `trust.isTrustworthy`, reputation, income, and lending capacity to apply your rules

          - Optionally verify REP passport via `GET /api/agent/verify/{"{id}"}`

        

        ## Screen endpoint
        ```
{`curl -X POST ${API_URL}/api/lender/screen \\
  -H "Content-Type: application/json" \\
  -H "X-PAYMENT: " \\
  -d '{
    "walletAddress": "0xBorrowerWallet...",
    "callerAddress": "0xYourLenderWallet..."
  }'`}
```
        
          **callerAddress** is required — the lender wallet that pays 0.01 USDT via x402
          on Celo mainnet.
        

        ## Response fields
        
          - 
            **trust.isTrustworthy** — boolean trustworthiness flag
          

          - 
            **income** — monthly estimate, stability label, weekly consistency
          

          - 
            **lending** — min/max USD capacity, confidence, and risk category
          

          - 
            **scores** — financial health and wallet reputation scores
          

        
        
          Schema:{" "}
          
            lenderScreenResult.schema.json
          
        

        ## REP passport
        ### Sample passport
        
          You can view an example of a generated REP passport. The PDF contains verified
          financial signals including the wallet's health score, estimated income, and transaction summary.
        

        
          
            View Sample REP Passport →
          
        

        ### Verify onchain
        
          Borrowers can purchase a verified financial passport (`REP-{"{id}"}`) for 0.10 USDT.
          Verify it in your flow:
        

        ```
{`curl ${API_URL}/api/agent/verify/REP-X141GYYEUM`}
```

        
          
            Payments
            x402 payments →
          
          
            Signals
            Signal endpoints →
          
        
      
    
  );
}