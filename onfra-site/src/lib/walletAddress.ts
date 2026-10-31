// Put this in lib/walletAddress.ts

const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

export function isEvmAddress(value: string): boolean {
  return EVM_ADDRESS_RE.test(value.trim());
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}