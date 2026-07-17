import { isEvmAddress } from "@/lib/agent/validate";

const ADDRESS_IN_TEXT = /0x[a-fA-F0-9]{40}/g;
const PARTIAL_ADDRESS = /0x[a-fA-F0-9]{1,39}(?![a-fA-F0-9])/g;

export function normalizeWalletAddress(value: string): string {
  return value.trim().toLowerCase();
}

export function isSameWallet(a: string, b: string): boolean {
  return normalizeWalletAddress(a) === normalizeWalletAddress(b);
}

export function extractWalletAddresses(text: string): string[] {
  const matches = text.match(ADDRESS_IN_TEXT) ?? [];
  return [...new Set(matches.map(normalizeWalletAddress))];
}

/** Detects malformed 0x fragments that are not valid 40-hex addresses. */
export function findInvalidAddressFragments(text: string): string[] {
  const valid = new Set(extractWalletAddresses(text));
  const invalid: string[] = [];

  for (const match of text.match(PARTIAL_ADDRESS) ?? []) {
    if (!valid.has(normalizeWalletAddress(match))) {
      invalid.push(match);
    }
  }

  return invalid;
}

export type QueryTarget = {
  callerWallet: string;
  targetWallet: string;
  isOwnWallet: boolean;
  isExternal: boolean;
};

/**
 * Resolves which wallet a chat message refers to.
 * No address in message → caller's wallet (free).
 * Address matching caller → own wallet (free).
 * Different address → external lookup (paid).
 */
export function resolveChatQueryTarget(
  message: string,
  callerWallet: string | undefined
): { ok: true; target: QueryTarget } | { ok: false; code: string; error: string } {
  const invalidFragments = findInvalidAddressFragments(message);
  if (invalidFragments.length > 0) {
    return {
      ok: false,
      code: "INVALID_WALLET",
      error: `"${invalidFragments[0]}" is not a valid wallet address. Use a full 0x address with 40 hex characters.`
    };
  }

  const mentioned = extractWalletAddresses(message);
  
  let caller = "";
  if (callerWallet) {
    caller = normalizeWalletAddress(callerWallet);
    if (!isEvmAddress(caller)) {
      return {
        ok: false,
        code: "INVALID_CALLER",
        error: "Connect a valid wallet before querying."
      };
    }
  }

  let targetWallet = caller;
  if (mentioned.length === 1) {
    targetWallet = mentioned[0]!;
  } else if (mentioned.length > 1) {
    return {
      ok: false,
      code: "MULTIPLE_WALLETS",
      error: "Please ask about one wallet address at a time."
    };
  }

  if (!targetWallet) {
    return {
      ok: false,
      code: "MISSING_WALLET",
      error: "Please provide a wallet address to query."
    };
  }

  const isOwnWallet = caller ? isSameWallet(caller, targetWallet) : false;
  return {
    ok: true,
    target: {
      callerWallet: caller,
      targetWallet,
      isOwnWallet,
      isExternal: !isOwnWallet
    }
  };
}

/** Detects when the user wants a verified report (0.10 USDT), not a chat query (0.01 USDT). */
export function isReportRequest(message: string): boolean {
  const q = message.toLowerCase();

  if (
    /\b(what is|what's|what are|explain|tell me about|how does|how do|describe)\b/.test(q)
  ) {
    return false;
  }

  if (
    /\b(generate|create|produce|issue|buy|purchase|order|download)\b/.test(q) &&
    /\breport\b/.test(q)
  ) {
    return true;
  }

  if (
    /\b(get|make)\b/.test(q) &&
    /\b(me\s+)?(a\s+)?(verified|official|full|premium)?\s*report\b/.test(q)
  ) {
    return true;
  }

  if (
    /\b(generate|create|get|buy|purchase|order|download)\b/.test(q) &&
    /\b(financial passport|attestation)\b/.test(q)
  ) {
    return true;
  }

  if (/\b(verified|official|full|premium)\s+(financial\s+)?report\b/.test(q)) {
    return true;
  }

  if (/\bfinancial passport\b/.test(q)) {
    return true;
  }

  return false;
}

export function resolveAnalysisTarget(
  walletAddress: string,
  callerAddress?: string
): QueryTarget {
  const targetWallet = normalizeWalletAddress(walletAddress);
  const callerWallet = callerAddress
    ? normalizeWalletAddress(callerAddress)
    : "";

  const isOwnWallet = callerWallet ? isSameWallet(callerWallet, targetWallet) : false;
  return {
    callerWallet,
    targetWallet,
    isOwnWallet,
    isExternal: !isOwnWallet
  };
}
