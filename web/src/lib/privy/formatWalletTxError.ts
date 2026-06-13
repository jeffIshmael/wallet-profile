const GAS_SPONSORSHIP_DISABLED =
  "Gas sponsorship is not enabled in Privy. Enable it in Privy Dashboard → Wallet infrastructure → Gas sponsorship, add Celo (42220), allow client-side transactions, and fund gas credits.";

const INSUFFICIENT_GAS_FUNDS =
  "This wallet does not have enough CELO for gas. Enable Privy gas sponsorship for embedded wallets, or add a small CELO balance to the wallet.";

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

  if (
    combined.includes("insufficient funds") ||
    combined.includes("insufficient balance") ||
    combined.includes("gas required exceeds allowance")
  ) {
    return INSUFFICIENT_GAS_FUNDS;
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
