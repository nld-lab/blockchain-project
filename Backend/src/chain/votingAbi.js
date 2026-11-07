export const votingAbi = [
  "function state() view returns (uint8)",
  "function title() view returns (string)",
  "function turnout() view returns (uint256)",
  "function exists() view returns (bool)",
  "function registered(bytes32) view returns (bool)",
  "function hasVoted(bytes32) view returns (bool)",
  "function getChoices() view returns (string[])",
  "function getTallies() view returns (uint256[])",
  "function createElection(string,string[])",
  "function openElection()",
  "function closeElection()",
  "function publishResults()",
  "function registerVoter(bytes32)",
  "function castVote(bytes32,uint256)",
  "event ElectionCreated(string title, uint256 choiceCount)",
  "event ElectionOpened()",
  "event ElectionClosed()",
  "event ResultsPublished()",
  "event VoterRegistered(bytes32 indexed voterHash)",
  "event VoteCast(bytes32 indexed voterHash)",
];

export const ELECTION_STATES = ["Draft", "Open", "Closed", "ResultsPublished"];
