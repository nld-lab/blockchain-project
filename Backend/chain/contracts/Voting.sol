// Le contrat final appartient au coéquipier Solidity. Conserver ces signatures.
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Contrat d'intégration local. Le backend est le seul signataire (owner = relayer).
contract Voting {
    enum State {
        Draft,
        Open,
        Closed,
        ResultsPublished
    }

    address public owner;
    State public state;
    string public title;
    bool public exists;
    uint256 public turnout;

    string[] private choices;
    uint256[] private tallies;
    mapping(bytes32 => bool) public registered;
    mapping(bytes32 => bool) public hasVoted;

    event ElectionCreated(string title, uint256 choiceCount);
    event ElectionOpened();
    event ElectionClosed();
    event ResultsPublished();
    event VoterRegistered(bytes32 indexed voterHash);
    event VoteCast(bytes32 indexed voterHash);

    modifier onlyOwner() {
        require(msg.sender == owner, "Reserve au backend");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createElection(string calldata newTitle, string[] calldata newChoices) external onlyOwner {
        require(bytes(newTitle).length > 0, "Intitule requis");
        require(newChoices.length >= 2, "Au moins deux choix");
        require(!exists || state == State.Draft, "Scrutin deja cree");

        while (choices.length > 0) {
            choices.pop();
        }
        while (tallies.length > 0) {
            tallies.pop();
        }

        title = newTitle;
        for (uint256 i = 0; i < newChoices.length; i++) {
            require(bytes(newChoices[i]).length > 0, "Choix vide");
            choices.push(newChoices[i]);
            tallies.push(0);
        }

        turnout = 0;
        exists = true;
        state = State.Draft;
        emit ElectionCreated(newTitle, newChoices.length);
    }

    function openElection() external onlyOwner {
        require(exists && state == State.Draft, "Ouverture impossible");
        state = State.Open;
        emit ElectionOpened();
    }

    function closeElection() external onlyOwner {
        require(state == State.Open, "Cloture impossible");
        state = State.Closed;
        emit ElectionClosed();
    }

    function publishResults() external onlyOwner {
        require(state == State.Closed, "Publication impossible");
        state = State.ResultsPublished;
        emit ResultsPublished();
    }

    function registerVoter(bytes32 voterHash) external onlyOwner {
        require(state == State.Open, "Inscription fermee");
        require(voterHash != bytes32(0), "Hash invalide");
        if (registered[voterHash]) {
            return;
        }
        registered[voterHash] = true;
        emit VoterRegistered(voterHash);
    }

    function castVote(bytes32 voterHash, uint256 choiceId) external onlyOwner {
        require(state == State.Open, "Vote ferme");
        require(registered[voterHash], "Electeur non inscrit");
        require(!hasVoted[voterHash], "Deja vote");
        require(choiceId < choices.length, "Choix invalide");

        hasVoted[voterHash] = true;
        tallies[choiceId] += 1;
        turnout += 1;
        emit VoteCast(voterHash);
    }

    function getChoices() external view returns (string[] memory) {
        return choices;
    }

    function getTallies() external view returns (uint256[] memory) {
        return tallies;
    }
}
