import { NextApiRequest, NextApiResponse } from "next";
import { mcpServer } from "@/lib/mcpServer";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

const transports = new Map<string, SSEServerTransport>();

if (process.env.NODE_ENV !== "production") {
  if (!(global as any).mcpTransports) {
    (global as any).mcpTransports = transports;
  }
}
export const getTransports = () => (global as any).mcpTransports || transports;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const sessionId = Math.random().toString(36).substring(7);
  const transport = new SSEServerTransport("/api/docs-mcp/messages", res);
  
  getTransports().set(sessionId, transport);
  
  await transport.start();
  mcpServer.server.connect(transport);

  req.on("close", () => {
    getTransports().delete(sessionId);
  });
}
