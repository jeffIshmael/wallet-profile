import { tool } from "@langchain/core/tools";

// Mock local balance database
const userBalances: Record<string, number> = {};
let activeUserWallet: string = "0x4821ced48Fb4456055c86E42587f61c1F39c6315"; // Default sample wallet

// Seed active wallet with 1.00 USDT
userBalances[activeUserWallet] = 1.00;

export function getActiveUserWallet(): string {
  return activeUserWallet;
}

export function setActiveUserWallet(walletAddress: string): void {
  activeUserWallet = walletAddress.toLowerCase();
  if (userBalances[activeUserWallet] === undefined) {
    userBalances[activeUserWallet] = 1.00; // auto-seed new wallet with 1.00 USDT for ease of demo
  }
}

export function getUserBalance(walletAddress: string): number {
  return userBalances[walletAddress.toLowerCase()] || 0;
}

export function topUpUser(walletAddress: string, amount: number): void {
  const addr = walletAddress.toLowerCase();
  userBalances[addr] = (userBalances[addr] || 0) + amount;
}

export function deductUser(walletAddress: string, amount: number): boolean {
  const addr = walletAddress.toLowerCase();
  const current = userBalances[addr] || 0;
  if (current >= amount) {
    userBalances[addr] = parseFloat((current - amount).toFixed(4));
    return true;
  }
  return false;
}

export class InsufficientBalanceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientBalanceError";
  }
}

/**
 * Gates a LangChain tool behind an X402 microbilling payment.
 */
export function wrapWithX402(originalTool: any, costUsdt: number) {
  const wrapped = tool(
    async (args: any, config: any) => {
      const wallet = getActiveUserWallet();
      console.log(`[X402 Billing] Attempting to charge ${costUsdt} USDT from wallet ${wallet} for using tool "${originalTool.name}"...`);
      
      const success = deductUser(wallet, costUsdt);
      if (!success) {
        const bal = getUserBalance(wallet);
        throw new InsufficientBalanceError(
          `Insufficient balance. Tool "${originalTool.name}" costs ${costUsdt} USDT. Your balance is ${bal} USDT. Please top up.`
        );
      }
      
      console.log(`[X402 Billing] Successfully charged ${costUsdt} USDT. Remaining balance: ${getUserBalance(wallet)} USDT.`);
      
      // Run the original tool
      return await originalTool.invoke(args, config);
    },
    {
      name: originalTool.name,
      description: `${originalTool.description} (Costs ${costUsdt} USDT via X402)`,
      schema: originalTool.schema,
    }
  );
  return wrapped;
}
