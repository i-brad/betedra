export type SerializedBigNumber = string;

export enum LotteryStatus {
  PENDING = "pending",
  OPEN = "open",
  CLOSE = "close",
  CLAIMABLE = "claimable",
}

export type LotteryStatusType =
  | (typeof LotteryStatus)[keyof typeof LotteryStatus]
  | (string & {});

export interface LotteryTicket {
  id: string;
  number: string;
  status: boolean;
  rewardBracket?: number;
  roundId?: string;
  hbarReward?: string;
}

export interface LotteryTicketClaimData {
  ticketsWithUnclaimedRewards: LotteryTicket[];
  allWinningTickets: LotteryTicket[];
  hbarTotal: BigNumber;
  roundId: string;
}

export interface LotteryRoundUserTickets {
  isLoading?: boolean;
  tickets?: LotteryTicket[];
}

interface LotteryRoundGenerics {
  isLoading?: boolean;
  lotteryId: string;
  status: LotteryStatus;
  startTime: string;
  endTime: string;
  treasuryFee: string;
  firstTicketId: string;
  finalNumber: string;
}

export interface LotteryRound extends LotteryRoundGenerics {
  userTickets?: LotteryRoundUserTickets;
  priceTicketInWHbar: BigNumber;
  discountDivisor: BigNumber;
  amountCollectedInWHbar: BigNumber;
  hbarPerBracket: string[];
  countWinnersPerBracket: string[];
  rewardsBreakdown: string[];
}

export interface LotteryResponse extends LotteryRoundGenerics {
  priceTicketInWHbar: SerializedBigNumber;
  discountDivisor: SerializedBigNumber;
  amountCollectedInWHbar: SerializedBigNumber;
  hbarPerBracket: SerializedBigNumber[];
  countWinnersPerBracket: SerializedBigNumber[];
  rewardsBreakdown: SerializedBigNumber[];
}

export interface LotteryState {
  currentLotteryId: string;
  maxNumberTicketsPerBuyOrClaim: string;
  isTransitioning: boolean;
  currentRound: LotteryResponse & { userTickets?: LotteryRoundUserTickets };
  lotteriesData?: LotteryRoundGraphEntity[];
  userLotteryData: LotteryUserGraphEntity;
}

export interface LotteryRoundGraphEntity {
  id: string;
  totalUsers: string;
  totalTickets: string;
  winningTickets: string;
  status: LotteryStatus;
  finalNumber: string;
  startTime: string;
  endTime: string;
  ticketPrice: SerializedBigNumber;
}

export interface LotteryUserGraphEntity {
  account: string;
  totalWHbar: string;
  totalTickets: string;
  rounds: UserRound[];
}

export interface UserRound {
  claimed: boolean;
  lotteryId: string;
  status: LotteryStatus;
  endTime: string;
  totalTickets: string;
  tickets?: LotteryTicket[];
}

export interface UserRoundProps {
  userTickets: LotteryTicket[];
  round: LotteryResponse;
}
