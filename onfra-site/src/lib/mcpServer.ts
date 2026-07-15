import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fs from "fs";
import path from "path";

// Initialize the MCP server
export const mcpServer = new McpServer({
  name: "onfra-docs",
  version: "1.0.0"
});

// Helper to get markdown files
function getDocsFiles(): { name: string; content: string }[] {
  const docsDir = path.join(process.cwd(), "public", "docs-md");
  if (!fs.existsSync(docsDir)) return [];
  
  return fs.readdirSync(docsDir)
    .filter(f => f.endsWith('.md'))
    .map(f => ({
      name: f,
      content: fs.readFileSync(path.join(docsDir, f), 'utf-8')
    }));
}

// Register tools
mcpServer.tool("search_docs", 
  "Search the OnFRA documentation for a specific query", 
  {
    query: z.string().describe("The search term or phrase to look for in the documentation")
  },
  async ({ query }) => {
    const files = getDocsFiles();
    const results = files.filter(f => f.content.toLowerCase().includes(query.toLowerCase()));
    
    if (results.length === 0) {
      return { content: [{ type: "text", text: `No results found for "${query}"` }] };
    }

    const summary = results.map(r => r.name).join(", ");
    return { 
      content: [{ 
        type: "text", 
        text: `Found matches in: ${summary}.\n\nUse get_page to retrieve the full content.` 
      }] 
    };
  }
);

mcpServer.tool("get_page",
  "Retrieve the full Markdown content of a specific documentation page",
  {
    pageId: z.string().describe("The ID or filename of the page (e.g. 'rest-api', 'agents', 'index')")
  },
  async ({ pageId }) => {
    const sanitized = pageId.replace(/\.\./g, "").replace(/\.md$/, "");
    const docsDir = path.join(process.cwd(), "public", "docs-md");
    const filepath = path.join(docsDir, `${sanitized}.md`);
    
    if (!fs.existsSync(filepath)) {
      return { content: [{ type: "text", text: `Page "${sanitized}" not found.` }] };
    }

    const content = fs.readFileSync(filepath, 'utf-8');
    return { content: [{ type: "text", text: content }] };
  }
);
