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
  { id: "skills-cli", title: "Skills CLI" },
  { id: "mcp-discovery", title: "MCP discovery" },
  { id: "what-you-get", title: "What the skill teaches" }
];

export default function InstallDocsPage() {
  return (
    
      
      # Install OnFRA for agents
      
        Add the OnFRA skill so AI agents know how to analyze wallets, handle x402 payments, and verify
        REP passports.
      

      
        ## Skills CLI
        Run from your project root:

        ```
npx skills add github:jeffIshmael/onfra-skill
```
        
          Works with Cursor, Claude Code, Antigravity, and other agents that support the Skills CLI.
          The skill installs into your project&apos;s `.agents/skills/` directory.
        

        ## MCP discovery
        
          For tool-based discovery without installing files, point your MCP client at the live manifest:
        

        ```
{`${API_URL}/.well-known/mcp.json`}
```
        
          See MCP &amp; ERC-8004 for tool names, input schemas, and
          routing.
        

        ## What the skill teaches
        
          - 
            `POST /api/agent/analyze` — full wallet reputation analysis
          

          - 
            `GET /api/wallet/{"{address}"}/signals/{"{signal}"}` — free cached signal reads
          

          - 
            `POST /api/lender/screen` — lender underwriting screen
          

          - 
            `GET /api/agent/verify/{"{reportId}"}` — verify REP passports
          

          - x402 `X-PAYMENT` header handling for external wallet queries

        

        ### Source
        
          
            github.com/jeffIshmael/onfra-skill
          
        

        
          
            Next
            REST API →
          
          
            Agents
            MCP &amp; ERC-8004 →
          
        
      
    
  );
}