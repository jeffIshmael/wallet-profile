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
        `Missing PROXY_ADDRESS env var and deployment file: ${deploymentFile}`
      );
    }
    const record = JSON.parse(fs.readFileSync(deploymentFile, "utf8")) as DeploymentRecord;
    proxyAddress = record.proxy;
  }

  console.log("Upgrading OnchainReporter proxy at:", proxyAddress);

  const OnchainReporter = await ethers.getContractFactory("OnchainReporter");
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
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
