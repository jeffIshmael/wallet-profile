import { SIGNAL_IDS, ANALYZE_FIELD_KEYS } from "@/lib/agent/analysisSignals";
import { getAttributionTag, getX402PayToAddress, isX402Enforced } from "@/lib/agent/env";
import {
  APP_BASE_URL,
  AUTH_SCHEME,
  CHAIN,
  CHAIN_ID,
  ONCHAIN_REPORTER_PROXY,
  ERC8004_AGENT_ID,
  ERC8004_IDENTITY_REGISTRY,
  ERC8004_REPUTATION_REGISTRY,
  PAYMENT_HEADER,
  PRICING,
  USDT_CELO_MAINNET
} from "@/lib/blockchain/constants";

export async function GET() {
  const payTo = getX402PayToAddress() ?? null;
  const base = APP_BASE_URL;
  const attributionTag = getAttributionTag();

  return Response.json({
    name: "OnFRA",
    version: "1.0.0",
    baseUrl: base,
    chain: CHAIN,
    chainId: CHAIN_ID,
    attributionTag,
    auth: {
      scheme: AUTH_SCHEME,
      model: "x402-pay-per-request",
      apiKeyRequired: false,
      paymentHeader: PAYMENT_HEADER,
      enforced: isX402Enforced(),
      payTo,
      asset: USDT_CELO_MAINNET,
      assetSymbol: "USDT",
      configUrl: `${base}/api/x402/config`,
      paymentRequiredExample: {
        status: 402,
        code: "PAYMENT_REQUIRED",
        payTo,
        priceUsdt: PRICING.externalWalletQueryUsdt,
        asset: USDT_CELO_MAINNET,
        network: CHAIN,
        chainId: CHAIN_ID,
        paymentHeader: PAYMENT_HEADER
      }
    },
    onChain: {
      usdtSettlement: {
        action: "Settle x402 micropayments in USDT on Celo mainnet",
        token: USDT_CELO_MAINNET,
        payTo,
        chainId: CHAIN_ID
      },
      repAttestation: {
        action: "Publish verified REP passport hash via OnchainReporter.publishFinancialReport",
        contract: ONCHAIN_REPORTER_PROXY,
        explorer: `https://celoscan.io/address/${ONCHAIN_REPORTER_PROXY}`
      },
      repVerify: {
        action: "Verify a REP passport onchain via OnchainReporter.verifyReport / GET /api/agent/verify/{id}",
        contract: ONCHAIN_REPORTER_PROXY,
        freeEndpoint: "/api/agent/verify/{reportId}"
      },
      erc8004: {
        agentId: ERC8004_AGENT_ID,
        identityRegistry: ERC8004_IDENTITY_REGISTRY,
        reputationRegistry: ERC8004_REPUTATION_REGISTRY,
        scan: `https://8004scan.io/agents/celo/${ERC8004_AGENT_ID}`
      }
    },
    signals: {
      ids: SIGNAL_IDS,
      analyzeFields: ANALYZE_FIELD_KEYS,
      listUrl: "/api/wallet/{address}/signals",
      readUrl: "/api/wallet/{address}/signals/{signal}",
      pricing: "Cached signal GETs are free after analyze"
    },
    actions: [
      {
        id: "analyze_wallet",
        method: "POST",
        path: "/api/agent/analyze",
        priceUsdt: PRICING.externalWalletQueryUsdt,
        inputSchema: `${base}/schemas/walletAnalysisRequest.schema.json`,
        outputSchema: `${base}/schemas/walletAnalysisResult.schema.json`,
        description: "Full wallet financial reputation analysis (paid for agent/API callers)."
      },
      {
        id: "get_wallet_signal",
        method: "GET",
        path: "/api/wallet/{address}/signals/{signal}",
        priceUsdt: "0",
        inputSchema: null,
        outputSchema: `${base}/schemas/walletSignalResult.schema.json`,
        description: "Read one cached signal. Valid signal ids listed in signals.ids."
      },
      {
        id: "screen_wallet",
        method: "POST",
        path: "/api/lender/screen",
        priceUsdt: PRICING.externalWalletQueryUsdt,
        inputSchema: `${base}/schemas/lenderScreenRequest.schema.json`,
        outputSchema: `${base}/schemas/lenderScreenResult.schema.json`,
        description: "Lender underwriting screen."
      },
      {
        id: "chat_query",
        method: "POST",
        path: "/api/agent/chat",
        priceUsdt: PRICING.externalWalletQueryUsdt,
        inputSchema: `${base}/schemas/chatRequest.schema.json`,
        outputSchema: null,
        description: "Natural-language wallet Q&A."
      },
      {
        id: "generate_statement",
        method: "POST",
        path: "/api/agent/statement",
        priceUsdt: PRICING.externalWalletQueryUsdt,
        inputSchema: `${base}/schemas/statementRequest.schema.json`,
        outputSchema: null,
        description: "Generate statement PDF and pin to IPFS. period: 3M | 6M | 12M."
      },
      {
        id: "generate_report",
        method: "POST",
        path: "/api/agent/report",
        priceUsdt: PRICING.verifiedReportUsdt,
        inputSchema: `${base}/schemas/reportRequest.schema.json`,
        outputSchema: `${base}/schemas/reportResult.schema.json`,
        description: "Purchase verified REP passport (onchain attestation)."
      },
      {
        id: "verify_report",
        method: "GET",
        path: "/api/agent/verify/{reportId}",
        priceUsdt: "0",
        inputSchema: null,
        outputSchema: null,
        description: "Verify REP-{id} / WP-{id} onchain (free)."
      }
    ],
    discovery: {
      mcp: `${base}/.well-known/mcp.json`,
      agentCard: `${base}/.well-known/agent-card.json`,
      agentRegistration: `${base}/.well-known/agent.json`,
      health: `${base}/api/health/integrations`,
      skillInstall: "npx skills add jeffIshmael/onfra-skill",
      skillRepo: "https://github.com/jeffIshmael/onfra-skill",
      docs: "https://onfra.xyz/docs"
    }
  });
}
