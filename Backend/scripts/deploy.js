import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { network } from "hardhat";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LOCAL_RELAYER_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

function upsert(content, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  if (pattern.test(content)) {
    return content.replace(pattern, line);
  }
  return `${content.replace(/\s*$/, "")}\n${line}\n`;
}

async function main() {
  const { ethers } = await network.connect();
  const factory = await ethers.getContractFactory("Voting");
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log(address);

  const envPath = path.join(__dirname, "..", ".env");
  const examplePath = path.join(__dirname, "..", ".env.example");
  const current = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : fs.readFileSync(examplePath, "utf8");
  let next = upsert(current, "CONTRACT_ADDRESS", address);
  if (!/^RELAYER_PRIVATE_KEY=\S+/m.test(next)) {
    next = upsert(next, "RELAYER_PRIVATE_KEY", LOCAL_RELAYER_KEY);
  }
  fs.writeFileSync(envPath, next);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
