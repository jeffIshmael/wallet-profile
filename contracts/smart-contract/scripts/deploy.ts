import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import hre from "hardhat";
import { upgrades } from "@openzeppelin/hardhat-upgrades";
import { getProxyImplementationAddress } from "./utils/implementation.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const deploymentsDir = path.join(__dirname, "..", "deployments");

type DeploymentRecord = {
  network: string;
  proxy: string;
  implementation: string;
  admin: string;
  reporter: string;
  deployedAt: string;
};

async function main() {
  const connection = await hre.network.create();
  const { ethers } = connection;
  const upgradesApi = await upgrades(hre, connection);

  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    throw new Error(
      "No deployer account found. Add PRIVATE_KEY to contracts/smart-contract/.env before deploying."
    );
  }

  const deployer = signers[0];
  const reporterAddress = process.env.REPORTER_ADDRESS?.trim() ?? deployer.address;

  console.log("Deploying OnchainReporter with:", deployer.address);
  console.log(
    "Balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "CELO"
  );
  console.log("Reporter role granted to:", reporterAddress);

  const outfile = path.join(deploymentsDir, `${connection.networkName}.json`);
  if (fs.existsSync(outfile) && process.env.FORCE_REDEPLOY !== "1") {
    const existing = JSON.parse(fs.readFileSync(outfile, "utf8")) as DeploymentRecord;
    console.log("Deployment already recorded. Skipping redeploy.");
    console.log("Proxy:          ", existing.proxy);
    console.log("Implementation: ", existing.implementation);
    console.log("Set FORCE_REDEPLOY=1 to deploy a new proxy.");
    return;
  }

  const OnchainReporter = await ethers.getContractFactory("OnchainReporter");
  const proxy = await upgradesApi.deployProxy(
    OnchainReporter,
    [deployer.address, reporterAddress],
    {
      initializer: "initialize",
      kind: "uups"
    }
  );

  await proxy.waitForDeployment();
  const proxyAddress = await proxy.getAddress();
  const implementationAddress = await getProxyImplementationAddress(
    upgradesApi.erc1967,
    proxyAddress,
    connection.networkName
  );

  const record: DeploymentRecord = {
    network: connection.networkName,
    proxy: proxyAddress,
    implementation: implementationAddress,
    admin: deployer.address,
    reporter: reporterAddress,
    deployedAt: new Date().toISOString()
  };

  fs.mkdirSync(deploymentsDir, { recursive: true });
  fs.writeFileSync(outfile, JSON.stringify(record, null, 2));

  console.log("Proxy deployed at:          ", proxyAddress);
  console.log("Implementation deployed at: ", implementationAddress);
  console.log("Deployment saved to:        ", outfile);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
