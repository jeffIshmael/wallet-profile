import {
  getAttributionTag,
  getPublicX402PayToAddress,
  getX402PayToAddress,
  getX402SettlementMode,
  isX402Enforced,
  isX402ProductionSettlement
} from "@/lib/agent/env";

export async function GET() {
  const payTo = getX402PayToAddress();
  const settlementMode = getX402SettlementMode();

  return Response.json({
    payTo: payTo ?? null,
    settlementMode,
    production: isX402ProductionSettlement(),
    enforced: isX402Enforced(),
    publicPayTo: getPublicX402PayToAddress() ?? payTo ?? null,
    attributionTag: getAttributionTag(),
    // Wire format sent to api.x402.celo.org/settle (not legacy {payment, network})
    settleWireFormat: "paymentPayload-v1",
    settleFacilitator: "https://api.x402.celo.org/settle"
  });
}
