import { createPublicClient, createWalletClient, custom, encodeFunctionData, http, keccak256, toBytes, type EIP1193Provider } from "viem";
import { celo } from "@/lib/chains/celo";
import { isMiniPay } from "@/lib/minipay";
import { feeTokenFromPreferred, sendMiniPayTransaction } from "@/lib/minipay/transactions";
import { getPreferredStablecoin } from "@/lib/minipay/stablecoins";
import {
  ERC8004_AGENT_ID,
  ERC8004_IDENTITY_REGISTRY,
  ERC8004_REPUTATION_REGISTRY,
  getAppBaseUrl
} from "@/lib/blockchain/constants";
import { identityRegistryAbi, reputationRegistryAbi } from "@/lib/blockchain/abi/reputationRegistry";

const FEEDBACK_TAG = "starred";

export const AGENT_FEEDBACK_TAG_OPTIONS = [
  { id: "helpful", label: "Helpful" },
  { id: "fast-response", label: "Fast response" },
  { id: "accurate", label: "Accurate" },
  { id: "clear", label: "Clear answers" },
  { id: "insightful", label: "Great insights" }
] as const;

export type AgentFeedbackTagId = (typeof AGENT_FEEDBACK_TAG_OPTIONS)[number]["id"];

function scoreFromTags(_tags: AgentFeedbackTagId[]): number {
  return 100;
}

function buildFeedbackPayload(
  agentId: number,
  score: number,
  reviewerAddress: string,
  tags: AgentFeedbackTagId[]
) {
  const tagLabels = tags.map(
    (id) => AGENT_FEEDBACK_TAG_OPTIONS.find((option) => option.id === id)?.label ?? id
  );

  return {
    type: "https://eips.ethereum.org/EIPS/eip-8004#feedback-v1",
    agentId,
    rating: score,
    tag: FEEDBACK_TAG,
    tags,
    tagLabels,
    comment: `Chainalyse AI chat feedback: ${tagLabels.join(", ")}.`,
    reviewer: reviewerAddress,
    servicesUsed: ["chat_query"],
    platform: getAppBaseUrl(),
    reviewedAt: new Date().toISOString().slice(0, 10)
  };
}

export type GiveFeedbackCall = {
  to: `0x${string}`;
  data: `0x${string}`;
  score: number;
};

export async function assertCanSubmitFeedback(reviewerAddress: `0x${string}`): Promise<void> {
  const publicClient = createPublicClient({
    chain: celo,
    transport: http()
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
}

export async function buildGiveFeedbackCall(
  reviewerAddress: `0x${string}`,
  tags: AgentFeedbackTagId[]
): Promise<GiveFeedbackCall> {
  await assertCanSubmitFeedback(reviewerAddress);

  const score = scoreFromTags(tags);
  const feedbackJson = JSON.stringify(
    buildFeedbackPayload(ERC8004_AGENT_ID, score, reviewerAddress, tags),
    null,
    2
  );
  const feedbackURI = `data:application/json;charset=utf-8,${encodeURIComponent(feedbackJson)}`;
  const feedbackHash = keccak256(toBytes(feedbackJson));
  const endpoint = `${getAppBaseUrl()}/api/agent/chat`;

  const data = encodeFunctionData({
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

  return {
    to: ERC8004_REPUTATION_REGISTRY,
    data,
    score
  };
}

export async function submitErc8004Feedback(
  provider: EIP1193Provider,
  reviewerAddress: `0x${string}`,
  tags: AgentFeedbackTagId[]
): Promise<{ hash: `0x${string}`; score: number }> {
  const { to, data, score } = await buildGiveFeedbackCall(reviewerAddress, tags);

  const publicClient = createPublicClient({
    chain: celo,
    transport: http()
  });

  const walletClient = createWalletClient({
    chain: celo,
    transport: custom(provider)
  });

  if (isMiniPay()) {
    const preferred = await getPreferredStablecoin(reviewerAddress);
    const feeToken = feeTokenFromPreferred(preferred);
    const hash = await sendMiniPayTransaction(provider, {
      account: reviewerAddress,
      to,
      data,
      feeToken
    });
    await publicClient.waitForTransactionReceipt({ hash });
    return { hash, score };
  }

  const hash = await walletClient.sendTransaction({
    account: reviewerAddress,
    to,
    data
  });

  await publicClient.waitForTransactionReceipt({ hash });
  return { hash, score };
}

export function hasSubmittedFeedback(address: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(`chainalyse-feedback:${address.toLowerCase()}`) === "1";
}

export function markFeedbackSubmitted(address: string) {
  localStorage.setItem(`chainalyse-feedback:${address.toLowerCase()}`, "1");
}
