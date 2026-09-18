/** Production defaults so marketing/docs never point agents at localhost. */
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.onfra.xyz";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://onfra.xyz";
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? APP_URL).replace(/\/dashboard\/?$/, "");

export const LINKS = {
  app: APP_URL,
  site: SITE_URL,
  docs: "/docs",
  apiDocs: "/docs",
  skills: "/skills",
  pricing: "/pricing",
  stats: "/stats",
  github: "https://github.com/jeffIshmael/wallet-profile",
  skillRepo: "https://github.com/jeffIshmael/onfra-skill",
  agent8004: "https://8004scan.io/agents/celo/9219",
  /** Prefer same-origin well-known so AskBots homepage probes find manifests without hopping. */
  mcp: "/.well-known/mcp.json",
  agentCard: "/.well-known/agent-card.json",
  agentRegistration: "/.well-known/agent.json",
  /** Live API surfaces (app.onfra.xyz) */
  apiMcp: `${API_URL}/.well-known/mcp.json`,
  apiAgentCard: `${API_URL}/.well-known/agent-card.json`,
  capabilities: `${API_URL}/api/capabilities`,
  health: `${API_URL}/api/health/integrations`,
  x402Config: `${API_URL}/api/x402/config`
} as const;
