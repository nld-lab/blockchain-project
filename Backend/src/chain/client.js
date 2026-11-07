import { Contract, JsonRpcProvider, Wallet } from "ethers";
import { config } from "../config.js";
import { httpError } from "../httpError.js";
import { ELECTION_STATES, votingAbi } from "./votingAbi.js";

let contract;

export function assertChainConfigured() {
  if (!config.contractAddress || !config.relayerPrivateKey) {
    throw httpError(
      503,
      "CHAIN_NOT_CONFIGURED",
      "La blockchain n'est pas configurée. Renseignez CONTRACT_ADDRESS et RELAYER_PRIVATE_KEY.",
    );
  }
}

export function getContract() {
  assertChainConfigured();
  if (!contract) {
    const provider = new JsonRpcProvider(config.rpcUrl, config.chainId, {
      staticNetwork: true,
      cacheTimeout: -1,
    });
    const wallet = new Wallet(config.relayerPrivateKey, provider);
    contract = new Contract(config.contractAddress, votingAbi, wallet);
  }
  return contract;
}

export function resetContract() {
  contract = undefined;
}

function mapChainError(error) {
  const message = `${error.shortMessage || ""} ${error.reason || ""} ${error.message || ""}`;
  if (message.includes("Deja vote")) {
    return httpError(409, "ALREADY_VOTED", "Cet électeur a déjà voté.");
  }
  if (message.includes("Choix invalide")) {
    return httpError(400, "INVALID_CHOICE", "Ce choix n'existe pas.");
  }
  if (message.includes("Vote ferme") || message.includes("Inscription fermee")) {
    return httpError(409, "ELECTION_NOT_OPEN", "Le scrutin n'est pas ouvert.");
  }
  if (message.includes("Scrutin deja cree") || message.includes("Ouverture impossible") || message.includes("Cloture impossible") || message.includes("Publication impossible")) {
    return httpError(409, "INVALID_STATE", "Cette action n'est pas possible dans l'état actuel du scrutin.");
  }
  if (message.includes("Electeur non inscrit")) {
    return httpError(409, "NOT_REGISTERED", "L'électeur n'est pas inscrit.");
  }
  if (/ECONNREFUSED|ENOTFOUND|could not detect network|network changed|SERVER_ERROR|TIMEOUT/i.test(message) || error.code === "NETWORK_ERROR") {
    return httpError(503, "CHAIN_UNREACHABLE", "Le nœud blockchain local est injoignable.");
  }
  return httpError(502, "CHAIN_ERROR", "La transaction blockchain a échoué.");
}

export async function withChain(action) {
  try {
    return await action(getContract());
  } catch (error) {
    if (error.status) {
      throw error;
    }
    throw mapChainError(error);
  }
}

export async function readElection(chain = getContract()) {
  const exists = await chain.exists();
  if (!exists) {
    return { exists: false };
  }

  const [title, stateRaw, choices, turnout] = await Promise.all([
    chain.title(),
    chain.state(),
    chain.getChoices(),
    chain.turnout(),
  ]);
  const state = ELECTION_STATES[Number(stateRaw)] || "Unknown";
  const election = {
    exists: true,
    title,
    state,
    choices,
    turnout: Number(turnout),
  };

  if (state === "ResultsPublished") {
    const tallies = await chain.getTallies();
    election.tallies = tallies.map((votes, choiceId) => ({
      choiceId,
      label: choices[choiceId],
      votes: Number(votes),
    }));
  }

  return election;
}

export async function readJournal(chain = getContract()) {
  const queries = [
    ["ElectionCreated", chain.filters.ElectionCreated()],
    ["ElectionOpened", chain.filters.ElectionOpened()],
    ["ElectionClosed", chain.filters.ElectionClosed()],
    ["ResultsPublished", chain.filters.ResultsPublished()],
    ["VoterRegistered", chain.filters.VoterRegistered()],
    ["VoteCast", chain.filters.VoteCast()],
  ];

  const entries = [];
  for (const [type, filter] of queries) {
    const events = await chain.queryFilter(filter, 0);
    for (const event of events) {
      entries.push({
        type,
        txHash: event.transactionHash,
        blockNumber: event.blockNumber,
        voterHash: event.args?.voterHash ?? null,
      });
    }
  }

  entries.sort((left, right) => left.blockNumber - right.blockNumber || left.txHash.localeCompare(right.txHash));
  return entries;
}

export async function submitVote(chain, voterHashValue, choiceId) {
  const state = ELECTION_STATES[Number(await chain.state())];
  if (state !== "Open") {
    throw httpError(409, "ELECTION_NOT_OPEN", "Le scrutin n'est pas ouvert.");
  }
  if (await chain.hasVoted(voterHashValue)) {
    throw httpError(409, "ALREADY_VOTED", "Cet électeur a déjà voté.");
  }
  if (!(await chain.registered(voterHashValue))) {
    const registration = await chain.registerVoter(voterHashValue);
    await registration.wait();
  }
  const vote = await chain.castVote(voterHashValue, choiceId);
  const receipt = await vote.wait();
  return { txHash: receipt.hash, status: "voted" };
}
