import "dotenv/config";
import { Interface, JsonRpcProvider } from "ethers";
import { votingAbi } from "../src/chain/votingAbi.js";

const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8545";
const provider = new JsonRpcProvider(rpcUrl);
const contractInterface = new Interface(votingAbi);
const innerWidth = 42;

const actionLabels = {
  createElection: "Création du scrutin",
  openElection: "Ouverture du scrutin",
  closeElection: "Clôture du scrutin",
  publishResults: "Publication des résultats",
  registerVoter: "Inscription d'un électeur",
  castVote: "Vote",
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function describe(block) {
  if (block.number === 0) {
    return "Bloc 0   Genesis";
  }

  const labels = [];
  for (const hash of block.transactions) {
    const transaction = await provider.getTransaction(hash);
    if (!transaction) {
      labels.push("Transaction inconnue");
      continue;
    }
    if (!transaction.to) {
      labels.push("Déploiement du contrat");
      continue;
    }
    try {
      const parsed = contractInterface.parseTransaction({ data: transaction.data });
      labels.push(actionLabels[parsed?.name] || parsed?.name || "Transaction");
    } catch {
      labels.push("Transaction");
    }
  }

  if (labels.length === 0) {
    return `Bloc ${block.number}   Vide`;
  }
  return `Bloc ${block.number}   ${labels.join(", ")}`;
}

function printHashes(block) {
  console.log(`Previous  ${block.parentHash}`);
  console.log(`Hash      ${block.hash}`);
}

function printReady(heading) {
  console.log("");
  console.log(`┌${"─".repeat(innerWidth)}┐`);
  console.log(`│ ${heading.padEnd(innerWidth - 2)} │`);
  console.log(`│ ${"█".repeat(innerWidth - 2)} │`);
  console.log(`└${"─".repeat(innerWidth)}┘`);
}

async function showNew(heading) {
  console.log("");
  console.log(`┌${"─".repeat(innerWidth)}┐`);
  process.stdout.write("│ ");
  for (const character of heading.slice(0, innerWidth - 2)) {
    process.stdout.write(character);
    await sleep(16);
  }
  process.stdout.write(`${" ".repeat(Math.max(0, innerWidth - 2 - heading.length))} │\n`);
  process.stdout.write("│ ");
  for (const cell of "█".repeat(innerWidth - 2)) {
    process.stdout.write(cell);
    await sleep(18);
  }
  process.stdout.write(" │\n");
  console.log(`└${"─".repeat(innerWidth)}┘`);
  await sleep(180);
}

const latest = await provider.getBlockNumber();
for (let number = 0; number <= latest; number += 1) {
  const block = await provider.getBlock(number);
  printReady(await describe(block));
  printHashes(block);
}

console.log("\nEn attente des prochains blocs…");

provider.on("block", async (number) => {
  try {
    const block = await provider.getBlock(number);
    await showNew(await describe(block));
    printHashes(block);
  } catch (error) {
    console.error("Lecture du bloc impossible.");
    console.error(error.message);
  }
});
