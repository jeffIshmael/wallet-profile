const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;

export function isEvmAddress(value: unknown): value is string {
  return typeof value === "string" && EVM_ADDRESS.test(value);
}

export function parseJsonBody<T extends Record<string, unknown>>(body: unknown): T | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  return body as T;
}

export function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}
