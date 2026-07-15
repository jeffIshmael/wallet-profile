import Link from "next/link";
import {
  DocsBreadcrumb,
  DocsCode,
  DocsH2,
  DocsTable,
  McpConnectDropdown
} from "@/components/docs/DocsContent";
import { DocsShell } from "@/components/docs/DocsShell";
import { API_URL } from "@/lib/links";
import type { TocItem } from "@/lib/docsNav";

const TOC: TocItem[] = [
  { id: "overview", title: "Overview" },
  { id: "local", title: "Local stdio (Recommended)" },
  { id: "mcp", title: "Remote MCP manifest" },
  { id: "tools", title: "MCP tools" }
];

const TOOLS = [
  { name: "analyze_wallet", route: "POST /api/agent/analyze", desc: "Full financial analysis" },
  { name: "get_wallet_signal", route: "GET /api/wallet/{address}/signals/{signal}", desc: "Cached signal read" },
  { name: "screen_wallet", route: "POST /api/lender/screen", desc: "Lender underwriting screen" },
  { name: "chat_query", route: "POST /api/agent/chat", desc: "Natural-language queries" },
  { name: "generate_report", route: "POST /api/agent/report", desc: "Verified REP passport" },
  { name: "generate_statement", route: "POST /api/agent/statement", desc: "Generate transaction statement PDF" },
  { name: "verify_report", route: "GET /api/agent/verify/{id}", desc: "Verify REP-{id}" }
] as const;

export default function AgentsDocsPage() {
  return (
    
      
      
        # Model Context Protocol (MCP)
        
      
      
        Agents discover OnFRA tools via MCP and invoke them over REST with x402 payments. 
        You can run the OnFRA MCP server locally or point your client to our remote manifest.
      

      
        ## Local stdio (Recommended)
        
          Run it locally with Node. Your client spawns `npx` and talks to OnFRA over stdio. 
          Works in any stdio client (Cursor, Claude Desktop, LM Studio, Continue, MCP Inspector). Requires Node.js.
        

        
        
          - Run `npx -y @jeffishmael/onfra-skill` to test it.

          - Open your MCP config (e.g., `claude_desktop_config.json` or Cursor Settings → MCP).

          - Merge the snippet below into `mcpServers`.

          - Restart the client.

        

        ```
{`{
  "mcpServers": {
    "onfra-skill": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@jeffishmael/onfra-skill"],
      "env": {
        "CELO_PRIVATE_KEY": "0x..."
      }
    }
  }
}`}
```

        
          Keep `CELO_PRIVATE_KEY` out of source control — it stays securely on your machine to sign x402 payments.
        

        ## Remote hosted
        Skip the install — point at the hosted endpoint

        
          No Node, no keys. The hosted endpoint exposes all OnFRA tools for financial analysis, lender screening, and verified reports.
        

        
          Endpoint
          ```
{`${API_URL}/api/mcp`}
```
        

        Streamable HTTP clients
        
          For clients that support remote MCP URLs directly (Cursor, Claude, etc.):
        

        ```
{`{
  "mcpServers": {
    "onfra-mcp": {
      "url": "${API_URL}/api/mcp"
    }
  }
}`}
```

        Stdio-only clients (mcp-remote bridge)
        
          If your client only supports stdio, use `mcp-remote` to bridge to the hosted endpoint:
        

        ```
{`{
  "mcpServers": {
    "onfra-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "mcp-remote", "${API_URL}/api/mcp"]
    }
  }
}`}
```

        ## MCP tools
        
          
            
              Tool
              Route
              Description
            
          
          
            {TOOLS.map((tool) => (
              
                
                  `{tool.name}`
                
                
                  `{tool.route}`
                
                {tool.desc}
              
            ))}
          
        

        
          
            A2A
            Agent-to-Agent →
          
          
            Reference
            JSON schemas →
          
        
      
    
  );
}