export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? APP_URL;

export const LINKS = {
  app: APP_URL,
  docs: "/docs",
  apiDocs: "/docs",
  skills: "/skills",
  pricing: "/pricing",
  stats: "/stats",
  github: "https://github.com/jeffIshmael/wallet-profile",
  agent8004: "https://8004scan.io/agents/celo/9219",
  mcp: `${API_URL}/.well-known/mcp.json`,
  agentCard: `${API_URL}/.well-known/agent-card.json`
} as const;
