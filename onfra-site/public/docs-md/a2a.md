import Link from "next/link";
import {
  DocsBreadcrumb,
  DocsCode,
  DocsH2
} from "@/components/docs/DocsContent";
import { DocsShell } from "@/components/docs/DocsShell";
import { API_URL, LINKS } from "@/lib/links";
import type { TocItem } from "@/lib/docsNav";

const TOC: TocItem[] = [
  { id: "peer", title: "OnFRA as a peer agent" },
  { id: "skills", title: "Skills" },
  { id: "erc-8004", title: "ERC-8004" }
];

const SKILLS = [
  { name: "analyze_wallet", title: "Full Financial Analysis", allowed: "analyze_wallet" },
  { name: "screen_wallet", title: "Lender Screening", allowed: "screen_wallet" },
  { name: "chat_query", title: "Natural Language Queries", allowed: "chat_query" },
  { name: "get_wallet_signal", title: "Signal Reads", allowed: "get_wallet_signal" },
  { name: "generate_report", title: "Verified Reports", allowed: "generate_report, verify_report" }
];

export default function A2ADocsPage() {
  return (
    
      
      # OnFRA as a peer agent
      
        Other autonomous agents discover OnFRA via an Agent Card and delegate
        financial reputation checks and onchain reads over A2A JSON-RPC.
      

      
        ## Peer Discovery
        
          OnFRA exposes a read-only A2A server. Send structured tool invocations 
          to the JSON-RPC task server.
        

        
        
          
            Agent Card
            Machine-readable skills and JSON-RPC endpoint URL.

            ```
{`${API_URL}/.well-known/agent-card.json`}
```
          
          
            JSON-RPC task server
            POST message/send with an OnFRA tool payload.

            ```
{`${API_URL}/api/a2a`}
```
          
        

        
          Skill IDs (comma-separated)
          OnFRA A2A skills from the Agent Card.

          ```
{SKILLS.map(s => s.name).join(", ")}
```
        

        ## Skills ({SKILLS.length})
        Each skill maps to a subset of hosted MCP tools. Peers discover these via the Agent Card.

        
        
          {SKILLS.map((skill) => (
            
              
                {skill.name}
                {skill.title}
              
              
                Allowed tools: `{skill.allowed}`
              

            
          ))}
        

        ## ERC-8004
        
          OnFRA is an onchain-identified agent on Celo mainnet. View the public registration:
        

        
          
            8004scan.io/agents/celo/9219
          
        

        
          
            Reference
            JSON schemas →
          
          
            Setup
            Install skill →
          
        
      
    
  );
}