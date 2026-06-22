import {
  APP_BASE_URL,
  CELOSCAN_BASE_URL,
  ERC8004_AGENT_ID,
  ONCHAIN_REPORTER_PROXY
} from "@/lib/blockchain/constants";

/** Public links used across the app footer, README, and docs. */
export const PLATFORM_LINKS = {
  app: APP_BASE_URL,
  demo: "https://wallet-profile-orpin.vercel.app",
  video: "https://youtu.be/7WC3lD5dDj4",
  github: "https://github.com/jeffIshmael/wallet-profile",
  docs: "https://github.com/jeffIshmael/wallet-profile/tree/main/docs",
  x: "https://x.com/chainalyse_xyz",
  xHandle: "@chainalyse_xyz",
  onfra8004: `https://8004scan.io/agents/celo/${ERC8004_AGENT_ID}`,
  onchainReporter: `${CELOSCAN_BASE_URL}/address/${ONCHAIN_REPORTER_PROXY}`,
  networkManifest: `${APP_BASE_URL}/.well-known/minipay-network-manifest.json`,
  appIcon512: `${APP_BASE_URL}/icon-512.png`,
  onchainReporterAddress: ONCHAIN_REPORTER_PROXY
} as const;

export const footerLinks = [
  { label: "Support", href: "/support", external: false },
  { label: "Terms", href: "/terms", external: false },
  { label: "Privacy", href: "/privacy", external: false },
  { label: "Docs", href: PLATFORM_LINKS.docs, external: true },
  { label: "Stats", href: "/stats", external: false },
  { label: "Verify", href: "/verify", external: false }
] as const;
