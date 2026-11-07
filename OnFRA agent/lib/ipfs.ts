// FILE: lib/ipfs.ts
// IPFS pinning. By default this talks to Pinata with PINATA_JWT. The web app can inject its own pinning code with
// setIpfsAdapter() so statements use the same Pinata account and gateway as the rest of OnFRA.
import crypto from "node:crypto";

export interface IpfsAdapter {
  pin(buf: Buffer, filename: string, mime: string): Promise<{ cid: string }>;
  gatewayUrl(cid: string): string;
}

let adapter: IpfsAdapter | null = null;
export function setIpfsAdapter(a: IpfsAdapter | null) { adapter = a; }

const DEFAULT_GATEWAY = (process.env.IPFS_GATEWAY ?? "https://gateway.pinata.cloud/ipfs").replace(/\/$/, "");

export const sha256Hex = (buf: Buffer) => crypto.createHash("sha256").update(buf).digest("hex");
export const gatewayUrl = (cid: string) => (adapter ? adapter.gatewayUrl(cid) : `${DEFAULT_GATEWAY}/${cid}`);

export async function pinToIpfs(buf: Buffer, filename: string, mime: string): Promise<{ cid: string }> {
  if (adapter) return adapter.pin(buf, filename, mime);
  const jwt = process.env.PINATA_JWT;
  if (!jwt) throw new Error("PINATA_JWT is not set and no IPFS adapter was provided.");
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(buf)], { type: mime }), filename);
  form.append("pinataMetadata", JSON.stringify({ name: filename }));
  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", { method: "POST", headers: { Authorization: `Bearer ${jwt}` }, body: form });
  if (!res.ok) throw new Error(`IPFS pin failed (${res.status}): ${(await res.text()).slice(0, 200)}`);
  const cid = ((await res.json()) as { IpfsHash?: string }).IpfsHash;
  if (!cid) throw new Error("IPFS pin returned no CID");
  return { cid };
}

/** True only if the gateway actually serves the file back. The CID is not returned to callers until this passes. */
export async function verifyRetrievable(cid: string, tries = 5): Promise<boolean> {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(gatewayUrl(cid), { method: "GET", headers: { Range: "bytes=0-0" } });
      if (res.ok || res.status === 206) return true;
    } catch { /* retry */ }
    await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
  }
  return false;
}
