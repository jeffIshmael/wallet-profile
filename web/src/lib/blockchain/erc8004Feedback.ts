import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  keccak256,
  toBytes,
  type EIP1193Provider
} from "viem";
import { celo } from "viem/chains";
import {
  ERC8004_AGENT_ID,
  ERC8004_IDENTITY_REGISTRY,
  ERC8004_REPUTATION_REGISTRY,
  getAppBaseUrl
} from "@/lib/blockchain/constants";
import { identityRegistryAbi, reputationRegistryAbi } from "@/lib/blockchain/abi/reputationRegistry";

const FEEDBACK_TAG = "starred";

function buildFeedbackPayload(agentId: number, score: number, reviewerAddress: string) {
  return {
    type: "https://eips.ethereum.org/EIPS/eip-8004#feedback-v1",
    agentId,
    rating: score,
    tag: FEEDBACK_TAG,
    comment: "Wallet Analyst AI chat feedback submitted from the dashboard.",
    reviewer: reviewerAddress,
    servicesUsed: ["chat_query"],
    platform: getAppBaseUrl(),
    reviewedAt: new Date().toISOString().slice(0, 10)
  };
}

export async function submitErc8004Feedback(
  provider: EIP1193Provider,
  reviewerAddress: `0x${string}`,
  stars: number
): Promise<{ hash: `0x${string}` }> {
  const score = Math.min(100, Math.max(0, Math.round(stars * 20)));

  const publicClient = createPublicClient({
    chain: celo,
    transport: http()
  });

  const walletClient = createWalletClient({
    chain: celo,
    transport: custom(provider)
  });

  const agentOwner = await publicClient.readContract({
    address: ERC8004_IDENTITY_REGISTRY,
    abi: identityRegistryAbi,
    functionName: "ownerOf",
    args: [BigInt(ERC8004_AGENT_ID)]
  });

  if (agentOwner.toLowerCase() === reviewerAddress.toLowerCase()) {
    throw new Error("Agent owners cannot submit feedback for their own agent.");
  }

  const feedbackJson = JSON.stringify(
    buildFeedbackPayload(ERC8004_AGENT_ID, score, reviewerAddress),
    null,
    2
  );
  const feedbackURI = `data:application/json;charset=utf-8,${encodeURIComponent(feedbackJson)}`;
  const feedbackHash = keccak256(toBytes(feedbackJson));
  const endpoint = `${getAppBaseUrl()}/api/agent/chat`;

  const hash = await walletClient.writeContract({
    account: reviewerAddress,
    address: ERC8004_REPUTATION_REGISTRY,
    abi: reputationRegistryAbi,
    functionName: "giveFeedback",
    args: [
      BigInt(ERC8004_AGENT_ID),
      BigInt(score),
      0,
      FEEDBACK_TAG,
      "",
      endpoint,
      feedbackURI,
      feedbackHash
    ]
  });

  await publicClient.waitForTransactionReceipt({ hash });
  return { hash };
}

export function hasSubmittedFeedback(address: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(`walletanalyst-feedback:${address.toLowerCase()}`) === "1";
}

export function markFeedbackSubmitted(address: string) {
  localStorage.setItem(`walletanalyst-feedback:${address.toLowerCase()}`, "1");
}
