import Link from "next/link";
import {
  DocsBreadcrumb,
  DocsCode,
  DocsH2,
  DocsH3,
  DocsTable
} from "@/components/docs/DocsContent";
import { DocsShell } from "@/components/docs/DocsShell";
import { API_URL } from "@/lib/links";
import type { TocItem } from "@/lib/docsNav";

const TOC: TocItem[] = [
  { id: "cache-model", title: "Cache model" },
  { id: "signal-ids", title: "Signal IDs" },
  { id: "read-signal", title: "Read one signal" },
  { id: "fields-param", title: "fields parameter" }
];

export default function SignalsDocsPage() {
  return (
    
      
      # Signal endpoints
      
        After a wallet is analyzed, you can read individual reputation fields from the cache. Every API query, 
        including fetching cached signals, requires an x402 payment of 0.01 USDT.
      

      
        ## Cache model
        
          `POST /api/agent/analyze` runs the full analysis pipeline and writes to cache.
          Subsequent GET requests return cached slices until the TTL expires. Missing cache returns{" "}
          `404` with a hint to call `analyze` first.
        

        ```
{`curl -H "X-PAYMENT: " ${API_URL}/api/wallet/0xYourWallet.../signals`}
```
        Lists available signal IDs and whether valid cache exists for the wallet. Costs 0.01 USDT.

        ## Signal IDs
        
          
            
              Signal
              Returns
            
          
          
            
              
                `monthly-income`
              
              Income label, monthly estimate, weekly consistency, income by period
            
            
              
                `financial-health`
              
              Health score (0–100) and breakdown
            
            
              
                `reputation-score`
              
              Reputation score, category, rationale
            
            
              
                `loan-capacity`
              
              Min/max USD range, confidence, factors
            
            
              
                `statement`
              
              3-month inflow/outflow, net, monthly breakdown
            
            
              
                `assessment`
              
              AI narrative, strengths, watch items, attestation
            
          
        

        ## Read one signal
        ```
{`curl -H "X-PAYMENT: " ${API_URL}/api/wallet/0xYourWallet.../signals/loan-capacity`}
```
        Response shape:

        ```
{`{
  "signal": "loan-capacity",
  "walletAddress": "0x...",
  "cached": true,
  "fetchedAt": "2026-07-08T...",
  "expiresAt": "2026-07-09T...",
  "data": { "range": "...", "minLoanUsd": 0, "maxLoanUsd": 0, ... }
}`}
```

        ## fields parameter
        
          On `POST /api/agent/analyze`, pass `fields` in the body or query string
          to return a subset without full `walletData`:
        

        ```
{`curl -X POST '${API_URL}/api/agent/analyze?fields=loanCapacity,reputationScore' \\
  -H "Content-Type: application/json" \\
  -H "X-PAYMENT: " \\
  -d '{"walletAddress":"0xBorrower..."}'`}
```
        ### Allowed field keys
        
          `monthlyIncome`, `financialHealth`, `reputationScore`,{" "}
          `loanCapacity`, `statement`, `assessment`,{" "}
          `walletData`
        

        
          
            Payments
            x402 payments →
          
          
            Reference
            JSON schemas →
          
        
      
    
  );
}