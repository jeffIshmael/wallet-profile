// FILE: chains/intel_runner.ts
// Bundle entry for the web API: runs one intelligence tool directly (no LLM, no billing; the HTTP route handles payment).
import { intelTools } from "../tools/intel_index.js";
export { setIpfsAdapter, type IpfsAdapter } from "../lib/ipfs.js";

export const INTEL_TOOL_NAMES: string[] = intelTools.map((t) => t.name);

export type IntelErrorCode = "UNKNOWN_TOOL" | "BAD_REQUEST" | "NOT_FOUND" | "TOOL_ERROR";
export class IntelToolError extends Error {
  constructor(public code: IntelErrorCode, message: string, public details?: unknown) {
    super(message);
    this.name = "IntelToolError";
  }
}

const BAD_INPUT = /^(Invalid wallet address|Unsupported period|Invalid period range)/;
const NOT_FOUND = /^Transaction not found/;

/** Checks the input without running anything, so the API can reject bad requests BEFORE taking payment. */
export function validateIntelInput(name: string, args: unknown): { ok: true } | { ok: false; code: IntelErrorCode; message: string; details?: unknown } {
  const t = intelTools.find((x) => x.name === name) as any;
  if (!t) return { ok: false, code: "UNKNOWN_TOOL", message: `Unknown tool "${name}".` };
  const parsed = t.schema.safeParse(args ?? {});
  if (parsed.success) return { ok: true };
  return { ok: false, code: "BAD_REQUEST", message: "Invalid input.", details: parsed.error.issues.map((i: any) => ({ path: i.path.join("."), message: i.message })) };
}

export async function runIntelTool(name: string, args: unknown): Promise<Record<string, unknown>> {
  const t = intelTools.find((x) => x.name === name) as any;
  if (!t) throw new IntelToolError("UNKNOWN_TOOL", `Unknown tool "${name}".`);
  const parsed = t.schema.safeParse(args ?? {});
  if (!parsed.success) {
    throw new IntelToolError("BAD_REQUEST", "Invalid input.", parsed.error.issues.map((i: any) => ({ path: i.path.join("."), message: i.message })));
  }
  try {
    return JSON.parse(await t.invoke(parsed.data));
  } catch (e: any) {
    const msg = String(e?.message ?? e);
    if (BAD_INPUT.test(msg)) throw new IntelToolError("BAD_REQUEST", msg);
    if (NOT_FOUND.test(msg)) throw new IntelToolError("NOT_FOUND", msg);
    throw new IntelToolError("TOOL_ERROR", msg);
  }
}
