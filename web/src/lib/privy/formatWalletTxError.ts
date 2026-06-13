const GAS_SPONSORSHIP_DISABLED =
  "Gas sponsorship is not enabled in Privy. Enable it in Privy Dashboard → Wallet infrastructure → Gas sponsorship, add Celo (42220), allow client-side transactions, and fund gas credits.";

const INSUFFICIENT_GAS_FUNDS =
  "This wallet does not have enough CELO for gas. Enable Privy gas sponsorship for embedded wallets, or add a small CELO balance to the wallet.";

const INSUFFICIENT_USDT_FUNDS =
  "You need at least 0.01 USDT on Celo in your connected wallet to look up another address.";

const X402_NO_REQUIREMENTS_PREFIX =
  /^402 response has no usable x402 payment requirements\.\s*/i;

function extractInsufficientUsdtMessage(message: string): string | null {
  const match = message.match(/Insufficient USDT balance\.[\s\S]*/i);
  return match?.[0]?.trim() ?? null;
}

export function isGasSponsorshipDisabledError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const details =
    error && typeof error === "object" && "details" in error
      ? String((error as { details?: unknown }).details ?? "")
      : "";
  const combined = `${message} ${details}`.toLowerCase();
  return combined.includes("gas sponsorship is not enabled");
}

export function formatWalletTxError(error: unknown): string {
  if (error instanceof Error && error.message.includes("User rejected")) {
    return "Transaction cancelled.";
  }

  if (isGasSponsorshipDisabledError(error)) {
    return GAS_SPONSORSHIP_DISABLED;
  }

  const message = error instanceof Error ? error.message : String(error);
  const details =
    error && typeof error === "object" && "details" in error
      ? String((error as { details?: unknown }).details ?? "")
      : "";
  const combined = `${message} ${details}`.toLowerCase();

  const insufficientUsdt = extractInsufficientUsdtMessage(message);
  if (insufficientUsdt) return insufficientUsdt;

  if (X402_NO_REQUIREMENTS_PREFIX.test(message)) {
    const trimmed = message.replace(X402_NO_REQUIREMENTS_PREFIX, "").trim();
    if (trimmed) return trimmed;
  }

  if (
    combined.includes("insufficient usdt") ||
    combined.includes("insufficient balance") ||
    combined.includes("insufficient funds") ||
    combined.includes("gas required exceeds allowance")
  ) {
    if (combined.includes("usdt") || combined.includes("transfer amount exceeds")) {
      return INSUFFICIENT_USDT_FUNDS;
    }
    return INSUFFICIENT_GAS_FUNDS;
  }

  if (combined.includes("timed out while waiting for transaction")) {
    return "Transaction is taking too long to confirm. Check Celoscan for status, or try again.";
  }

  if (message.includes("ContractFunctionExecutionError")) {
    const detailMatch = /Details:\s*([^]+?)(?:\n\nVersion:|$)/.exec(message);
    if (detailMatch?.[1]) return detailMatch[1].trim();
  }

  return message || "Transaction failed.";
}

export function shouldUsePrivyGasSponsorship(): boolean {
  return process.env.NEXT_PUBLIC_PRIVY_SPONSOR_GAS !== "false";
}
