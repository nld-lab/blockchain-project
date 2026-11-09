export type ElectionState = "Draft" | "Open" | "Closed" | "ResultsPublished";

export type Election = {
  exists: boolean;
  title?: string;
  state?: ElectionState;
  choices?: string[];
  turnout?: number;
  tallies?: Array<{
    choiceId: number;
    label: string;
    votes: number;
  }>;
};

export type VoterStatus = {
  registered: boolean;
  hasVoted: boolean;
};

export type Transaction = {
  type: string;
  txHash: string;
  blockNumber: number;
  voterHash: string | null;
};

export type ApiError = Error & {
  code?: string;
  status?: number;
  details?: unknown;
};
