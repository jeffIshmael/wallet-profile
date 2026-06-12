import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import hre from "hardhat";
import { upgrades } from "@openzeppelin/hardhat-upgrades";
import { getProxyImplementationAddress } from "./utils/implementation.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const deploymentsDir = path.join(__dirname, "..", "deployments");

type DeploymentRecord = {
  proxy: string;
};

async function main() {
  const connection = await hre.network.create();
  const { ethers } = connection;
  const upgradesApi = await upgrades(hre, connection);

  const deploymentFile = path.join(deploymentsDir, `${connection.networkName}.json`);
  const proxyFromEnv = process.env.PROXY_ADDRESS;
  let proxyAddress = proxyFromEnv;

  if (!proxyAddress) {
    if (!fs.existsSync(deploymentFile)) {
      throw new Error(
        [
          `Missing PROXY_ADDRESS env var and deployment file: ${deploymentFile}`,
          "",
          "Fix:",
          "  1. Run on Celo mainnet:  npx hardhat run scripts/upgrade.ts --network celo",
          "  2. Or set PROXY_ADDRESS=0x50a8Fc322497e2EAc5489A64ce162E07Fb85E6AB",
          "  3. Ensure contracts/smart-contract/.env has PRIVATE_KEY (proxy admin)"
        ].join("\n")
      );
    }
    const record = JSON.parse(fs.readFileSync(deploymentFile, "utf8")) as DeploymentRecord;
    proxyAddress = record.proxy;
  }

  console.log("Upgrading OnchainReporter proxy at:", proxyAddress);

  const OnchainReporter = await ethers.getContractFactory("OnchainReporter");
  try {
    const upgraded = await upgradesApi.upgradeProxy(proxyAddress, OnchainReporter, {
      kind: "uups"
    });

    await upgraded.waitForDeployment();
    const implementationAddress = await getProxyImplementationAddress(
      upgradesApi.erc1967,
      proxyAddress,
      connection.networkName
    );

    if (fs.existsSync(deploymentFile)) {
      const record = JSON.parse(fs.readFileSync(deploymentFile, "utf8")) as Record<string, unknown>;
      record.implementation = implementationAddress;
      record.upgradedAt = new Date().toISOString();
      fs.writeFileSync(deploymentFile, JSON.stringify(record, null, 2));
    }

    console.log("OnchainReporter upgraded.");
    console.log("Proxy:          ", proxyAddress);
    console.log("Implementation: ", implementationAddress);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("incompatible")) {
      console.error("\nStorage layout is incompatible — an in-place upgrade is not safe.");
      console.error("The string-based REP-XXXXXXXXXX IDs need a NEW proxy deployment.\n");
      console.error("Deploy fresh proxy on Celo mainnet:");
      console.error("  FORCE_REDEPLOY=1 npx hardhat run scripts/deploy.ts --network celo\n");
      console.error("Then update web/.env:");
      console.error("  ONCHAIN_REPORTER_PROXY_ADDRESS=<new proxy from deployments/celo.json>\n");
      console.error("The old proxy (0x50a8Fc322497e2EAc5489A64ce162E07Fb85E6AB) keeps legacy numeric attestations only.");
    }
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
