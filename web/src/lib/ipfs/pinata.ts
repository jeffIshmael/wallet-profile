import { PinataSDK } from "pinata";

export type PinReportPdfResult = {
  cid: string;
  id: string;
  name: string;
  size: number;
};

function getPinataJwt(): string | undefined {
  return process.env.PINATA_JWT?.trim() || process.env.PINATA_JWT_SECRET?.trim();
}

export function getPinataGatewayDomain(): string | undefined {
  return process.env.PINATA_GATEWAY?.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function isPinataConfigured(): boolean {
  return Boolean(getPinataJwt());
}

function getPinataClient(): PinataSDK {
  const pinataJwt = getPinataJwt();
  if (!pinataJwt) {
    throw new Error("PINATA_JWT is not configured.");
  }

  const gateway = getPinataGatewayDomain();
  return new PinataSDK({
    pinataJwt,
    ...(gateway ? { pinataGateway: gateway } : {})
  });
}

export function buildIpfsGatewayUrl(cid: string): string {
  const normalized = cid.replace(/^ipfs:\/\//i, "");
  const gateway = getPinataGatewayDomain();
  if (gateway) {
    return `https://${gateway}/ipfs/${normalized}`;
  }
  return `https://ipfs.io/ipfs/${normalized}`;
}

export async function pinReportPdfToIpfs(
  pdfBytes: Uint8Array,
  filename: string
): Promise<PinReportPdfResult> {
  const pinata = getPinataClient();
  const file = new File([pdfBytes as BlobPart], filename, { type: "application/pdf" });
  const upload = await pinata.upload.public.file(file);

  return {
    cid: upload.cid,
    id: upload.id,
    name: upload.name,
    size: upload.size
  };
}
