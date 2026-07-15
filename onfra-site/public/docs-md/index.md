import Link from "next/link";
import {
  DocsBreadcrumb,
  DocsCode,
  DocsH2,
  DocsH3
} from "@/components/docs/DocsContent";
import { DocsShell } from "@/components/docs/DocsShell";
import { API_URL } from "@/lib/links";
import type { TocItem } from "@/lib/docsNav";

const TOC: TocItem[] = [
  { id: "what-is-onfra", title: "What is OnFRA?" },
  { id: "who-its-for", title: "Who it's for" },
  { id: "quick-start", title: "Quick start" },
  { id: "base-url", title: "Base URL" },
  { id: "supported-chains", title: "Supported chains" }
];

export default function GettingStartedPage() {
  return (
    
      
      # Integrating OnFRA
      
        OnFRA turns Celo wallet activity into financial reputation — income estimates, health scores,
        loan capacity, and verified REP passports. Use the REST API, MCP tools, or agent skill.
      

      
        ## What is OnFRA?
        
          OnFRA (Onchain Financial Reputation Agent) is infrastructure for reading a wallet&apos;s public
          onchain history and returning lender-friendly signals. One address in; structured reputation
          data out — no bank statements, no manual PDF review.
        

        Core outputs include:

        
          - 
            **Monthly income estimate** from stablecoin inflows and weekly patterns
          

          - 
            **Financial health score** (0–100) across income, savings, spending, and risk
          

          - 
            **Reputation score** and category for trust and maturity
          

          - 
            **Loan capacity range** with confidence level
          

          - 
            **REP passport** — verified report with onchain attestation
          

        

        ## Who it&apos;s for
        ### Lenders &amp; underwriters
        
          Call `POST /api/lender/screen` before extending credit. Use
          `trust.isTrustworthy`, reputation, average monthly income, and loan capacity
          range to apply your own underwriting rules.
        

        ### AI agents &amp; automations
        
          Install the OnFRA skill or discover tools via MCP. Agents can analyze wallets, read cached
          signals, and verify REP passports.
        

        ### Apps &amp; dashboards
        
          Embed reputation in your product with the REST API. Cache-first signal endpoints keep reads
          cheap after the first analysis.
        

        ## Quick start
        
          - 
            Install the skill for Cursor, Claude Code, or your agent
            runtime
          

          - 
            Pick an endpoint — `analyze` for full data,{" "}
            `screen` for lender decisions
          

          - 
            Add x402 payment when querying external wallets (0.01 USDT
            per refresh on Celo)
          

          - 
            Read cached signals for free after analysis
          

        

        ## Base URL
        ```
{API_URL}
```
        
          JSON schemas live at `{API_URL}/schemas/`. MCP manifest at{" "}
          `{API_URL}/.well-known/mcp.json`.
        

        ## Supported chains
        
          **Celo Mainnet** is supported today. Additional EVM chains are planned. All
          endpoints are Celo-first; wallet addresses are standard 0x EVM format.
        

        
          
            Next
            Install skill →
          
          
            Reference
            REST API →
          
        
      
    
  );
}