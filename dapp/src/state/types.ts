export enum PredictionStatus {
  INITIAL = "initial",
  LIVE = "live",
  PAUSED = "paused",
  ERROR = "error",
}

export enum BetPosition {
  BULL = "Bull",
  BEAR = "Bear",
  HOUSE = "House",
}

export const FetchStatus = {
  Idle: "idle",
  Fetching: "pending",
  Fetched: "success",
  Failed: "error",
} as const;

export type TFetchStatus = (typeof FetchStatus)[keyof typeof FetchStatus];

// Predictions

export interface Round {
  id: string;
  epoch: number;
  position: BetPosition;
  failed: boolean;
  startAt: number;
  startBlock: number;
  startHash: string;
  lockAt: number;
  lockBlock: number;
  lockHash: string;
  lockPrice: bigint;
  lockRoundId: string;
  closeAt: number;
  closeBlock: number;
  closeHash: string;
  closePrice: bigint;
  closeRoundId: string;
  totalBets: number;
  totalAmount: number;
  bullBets: number;
  bullAmount: number;
  bearBets: number;
  bearAmount: number;
  bets?: Bet[];

  AIPrice?: number;
}

export interface Market {
  paused: boolean;
  epoch: number;
}

export interface Bet {
  id?: string;
  hash?: string;
  amount: number;
  position: BetPosition;
  claimed: boolean;
  claimedAt: number;
  claimedBlock: number;
  claimedHash: string;
  claimedHBAR: number;
  claimedNetHBAR: number;
  createdAt: number;
  updatedAt: number;
  user?: PredictionUser;
  round?: Round;
}

export interface PredictionUser {
  id: string;
  createdAt: number;
  updatedAt: number;
  block: number;
  totalBets: number;
  totalBetsBull: number;
  totalBetsBear: number;
  totalHBAR: number;
  totalHBARBull: number;
  totalHBARBear: number;
  totalBetsClaimed: number;
  totalHBARClaimed: number;
  winRate: number;
  averageHBAR: number;
  netHBAR: number;
  bets?: Bet[];
}

export enum HistoryFilter {
  ALL = "all",
  COLLECTED = "collected",
  UNCOLLECTED = "uncollected",
}

export interface LedgerData {
  [key: string]: {
    [key: string]: ReduxNodeLedger;
  };
}

export interface RoundData {
  [key: string]: ReduxNodeRound;
}

export interface ReduxNodeLedger {
  position: BetPosition;
  amount: string;
  claimed: boolean;
}

export interface NodeLedger {
  position: BetPosition;
  amount: bigint;
  claimed: boolean;
}

export interface ReduxNodeRound {
  epoch: number;
  startTimestamp: number | null;
  lockTimestamp: number | null;
  closeTimestamp: number | null;
  lockPrice: string | null;
  closePrice: string | null;
  totalAmount: string;
  bullAmount: string;
  bearAmount: string;
  rewardBaseCalAmount: string;
  rewardAmount: string;
  oracleCalled: boolean;

  // PredictionsV2
  lockOracleId?: string | null;
  closeOracleId?: string | null;

  // AI Predictions
  AIPrice?: string | null;
}

export interface NodeRound {
  epoch: number;
  startTimestamp: number | null;
  lockTimestamp: number | null;
  closeTimestamp: number | null;
  lockPrice: bigint | null;
  closePrice: bigint | null;
  totalAmount: bigint | null;
  bullAmount: bigint | null;
  bearAmount: bigint | null;
  rewardBaseCalAmount: bigint | null;
  rewardAmount: bigint | null;
  oracleCalled: boolean;

  // PredictionsV2
  lockOracleId?: string | null;
  closeOracleId?: string | null;

  // AI Predictions
  AIPrice?: bigint | null;
}

export type LeaderboardFilterTimePeriod = "1d" | "7d" | "1m" | "all";

export interface LeaderboardFilter {
  address?: null | string;
  orderBy?: string;
  timePeriod?: LeaderboardFilterTimePeriod;
}

export enum PredictionsChartView {
  TradingView = "TradingView",
  Chainlink = "Chainlink Oracle",
  Pyth = "Pyth Oracle",
}

export interface PredictionsState {
  status: PredictionStatus;
  isLoading: boolean;
  isHistoryPaneOpen: boolean;
  chartView: PredictionsChartView;
  isChartPaneOpen: boolean;
  isFetchingHistory: boolean;
  historyFilter: HistoryFilter;
  currentEpoch: number;
  intervalSeconds: number;
  minBetAmount: string;
  bufferSeconds: number;
  history: Bet[];
  totalHistory: number;
  currentHistoryPage: number;
  hasHistoryLoaded: boolean;
  rounds?: RoundData;
  ledgers?: LedgerData;
  claimableStatuses: {
    [key: string]: boolean;
  };
  leaderboard: {
    selectedAddress: null | string;
    loadingState: TFetchStatus;
    filters: LeaderboardFilter;
    skip: number;
    hasMoreResults: boolean;
    addressResults: {
      [key: string]: null | PredictionUser;
    };
    results: PredictionUser[];
  };
}

export interface VoteWhere {
  id?: string;
  id_in?: string[];
  voter?: string;
  voter_in?: string[];
  proposal?: string;
  proposal_in?: string[];
}

export enum SnapshotCommand {
  PROPOSAL = "proposal",
  VOTE = "vote",
}

export enum ProposalType {
  ALL = "all",
  CORE = "core",
  COMMUNITY = "community",
}

export enum ProposalState {
  ACTIVE = "active",
  PENDING = "pending",
  CLOSED = "closed",
}

export enum ProposalTypeName {
  SINGLE_CHOICE = "single-choice",
  WEIGHTED = "weighted",
}

export interface Proposal {
  author: string;
  body: string;
  choices: string[];
  end: number;
  id: string;
  snapshot: string;
  votes: number;
  start: number;
  state: ProposalState;
  title: string;
  ipfs: string;
  type: ProposalTypeName;
  scores: number[];
  scores_total: number;
  space: {
    id: string;
    name: string;
  };
}

export interface Vote {
  id: string;
  voter: string;
  created: number;
  proposal: {
    choices: Proposal["choices"];
  };
  choice: number;
  metadata?: {
    votingPower: string;
  };
  vp: number;
  ipfs: string;
}
