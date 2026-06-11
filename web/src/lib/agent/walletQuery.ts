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
  callerWallet: string
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
  const caller = normalizeWalletAddress(callerWallet);

  if (!isEvmAddress(caller)) {
    return {
      ok: false,
      code: "INVALID_CALLER",
      error: "Connect a valid wallet before querying."
    };
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

  const isOwnWallet = isSameWallet(caller, targetWallet);
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

export function resolveAnalysisTarget(
  walletAddress: string,
  callerAddress?: string
): QueryTarget {
  const targetWallet = normalizeWalletAddress(walletAddress);
  const callerWallet = callerAddress
    ? normalizeWalletAddress(callerAddress)
    : targetWallet;

  const isOwnWallet = isSameWallet(callerWallet, targetWallet);
  return {
    callerWallet,
    targetWallet,
    isOwnWallet,
    isExternal: !isOwnWallet
  };
}
