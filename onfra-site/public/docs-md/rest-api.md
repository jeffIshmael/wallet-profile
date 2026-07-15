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
  { id: "endpoints", title: "Endpoints" },
  { id: "analyze", title: "Analyze wallet" },
  { id: "verify", title: "Verify report" },
  { id: "health", title: "Health & stats" }
];

export default function RestApiDocsPage() {
  return (
    
      
      # REST API
      
        All routes are served from `{API_URL}`. Paid routes settle in USDT on Celo via x402.
      

      
        ## Endpoints
        
          
            
              Method
              Route
              Description
              Price
            
          
          
            
              POST
              
                `/api/lender/screen`
              
              Lender underwriting — trust + income + loan capacity
              0.01 USDT
            
            
              POST
              
                `/api/agent/analyze`
              
              Full wallet analysis
              0.01 USDT
            
            
              POST
              
                `/api/agent/chat`
              
              Natural-language wallet queries
              0.01 USDT
            
            
              POST
              
                `/api/agent/report`
              
              Verified REP passport + attestation
              0.10 USDT
            
            
              POST
              
                `/api/agent/statement`
              
              Generate transaction statement PDF
              0.01 USDT
            
            
              GET
              
                `/api/agent/verify/{"{id}"}`
              
              Verify REP-{"{id}"} or hash
              Free
            
            
              GET
              
                `/api/wallet/{"{address}"}/signals`
              
              List signals + cache status
              0.01 USDT
            
            
              GET
              
                `/api/wallet/{"{address}"}/signals/{"{signal}"}`
              
              One reputation signal
              0.01 USDT
            
            
              GET
              
                `/api/wallet/{"{address}"}/analysis`
              
              Full walletData
              0.01 USDT
            
          
        

        ## Analyze wallet
        ```
{`curl -X POST ${API_URL}/api/agent/analyze \\
  -H "Content-Type: application/json" \\
  -d '{"walletAddress":"0xYourWallet..."}'`}
```
        
          For external wallets, include `X-PAYMENT` with a valid x402 signature. Pass{" "}
          `callerAddress` when the payer differs from the target wallet. Use optional{" "}
          `fields` to return a subset — see Signal endpoints.
        

        ### Response
        
          Returns financial health score, reputation score, income label, loan range, AI summary,
          attestation, and full `walletData` when no `fields` filter is set.
        

        ## Generate statement
        ```
{`curl -X POST ${API_URL}/api/agent/statement \\
  -H "Content-Type: application/json" \\
  -H "X-PAYMENT: " \\
  -d '{"walletAddress":"0xYourWallet...", "period": "3M"}'`}
```
        
          Generates a verified transaction statement PDF and pins it to IPFS. By default, it covers the last 3 months. You can specify the number of months by passing the `period` field in the request body. Allowed values are: `1M`, `3M`, `6M`, or `12M`.
        

        ## Verify report
        ```
{`curl ${API_URL}/api/agent/verify/REP-X141GYYEUM`}
```
        
          Confirms a verified financial passport was issued by OnFRA. Returns scores, report hash,
          IPFS CID, and onchain attestation status.
        

        ## Health &amp; stats
        ```
{`curl ${API_URL}/api/health/integrations
curl ${API_URL}/api/stats`}
```

        
          
            Lenders
            Lender screening →
          
          
            Reference
            JSON schemas →
          
        
      
    
  );
}