import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const openzeppelinDir = path.join(__dirname, "..", "..", ".openzeppelin");

type UpgradesErc1967 = {
  getImplementationAddress: (proxyAddress: string) => Promise<string>;
};

type ManifestImpl = {
  address: string;
};

type ManifestProxy = {
  address: string;
};

type OpenZeppelinManifest = {
  proxies?: ManifestProxy[];
  impls?: Record<string, ManifestImpl>;
};

function readManifest(networkName: string): OpenZeppelinManifest | undefined {
  const manifestPath = path.join(openzeppelinDir, `${networkName}.json`);
  if (!fs.existsSync(manifestPath)) {
    return undefined;
  }

  return JSON.parse(fs.readFileSync(manifestPath, "utf8")) as OpenZeppelinManifest;
}

function readImplementationFromManifest(
  networkName: string,
  proxyAddress: string
): string | undefined {
  const manifest = readManifest(networkName);
  if (!manifest?.proxies || !manifest.impls) {
    return undefined;
  }

  const proxyRegistered = manifest.proxies.some(
    (entry) => entry.address.toLowerCase() === proxyAddress.toLowerCase()
  );
  if (!proxyRegistered) {
    return undefined;
  }

  const implAddresses = Object.values(manifest.impls).map((entry) => entry.address);
  return implAddresses.at(-1);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getProxyImplementationAddress(
  erc1967: UpgradesErc1967,
  proxyAddress: string,
  networkName: string,
  options?: { retries?: number; delayMs?: number }
): Promise<string> {
  const retries = options?.retries ?? 6;
  const delayMs = options?.delayMs ?? 2000;
  let lastError: unknown;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await erc1967.getImplementationAddress(proxyAddress);
    } catch (error) {
      lastError = error;
      if (attempt < retries - 1) {
        await sleep(delayMs);
      }
    }
  }

  const fromManifest = readImplementationFromManifest(networkName, proxyAddress);
  if (fromManifest) {
    return fromManifest;
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Could not read implementation for proxy ${proxyAddress}`);
}
