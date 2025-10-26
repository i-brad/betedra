import { Bet, BetPosition, ReduxNodeLedger } from "@/state/types";
import { PredictionsLedgerResponse } from "@/utils/types";
import { Address } from "viem";
import { serializePredictionsLedgerResponse } from ".";
import { getPredictionsContract } from "./predictions";

export const ROUNDS_PER_PAGE = 10;

export enum Result {
  WIN = "win",
  LOSE = "lose",
  CANCELED = "canceled",
  HOUSE = "house",
  LIVE = "live",
}

export const fetchUsersRoundsLength = async (account: Address) => {
  try {
    const contract = getPredictionsContract();
    const length = await contract.getUserRoundsLength(account);
    return length;
  } catch {
    return 0n;
  }
};

export const fetchUserRounds = async (
  account: Address,
  cursor = 0,
  size = ROUNDS_PER_PAGE
): Promise<null | { [key: string]: ReduxNodeLedger }> => {
  const contract = getPredictionsContract();

  try {
    const [rounds, ledgers] = await contract.getUserRounds(
      account,
      BigInt(cursor),
      BigInt(size)
    );

    return rounds.reduce((accum: any, round: any, index: any) => {
      return {
        ...accum,
        [round.toString()]: serializePredictionsLedgerResponse(
          ledgers[index] as PredictionsLedgerResponse
        ),
      };
    }, {});
  } catch {
    // console.error("something wrong happened", error);
    // When the results run out the contract throws an error.
    return null;
  }
};

export const getRoundResult = (bet: Bet, currentEpoch: number): Result => {
  const { round } = bet;
  if (round?.failed) {
    return Result.CANCELED;
  }

  if (Number(round?.epoch) >= currentEpoch - 1) {
    return Result.LIVE;
  }

  // House Win would not occur in AI-based predictions, only in normal prediction feature
  if (bet?.round?.position === BetPosition.HOUSE) {
    return Result.HOUSE;
  }

  let roundResultPosition: BetPosition;

  // If AI-based prediction.
  if (round?.AIPrice) {
    if (
      // Result: UP, AI Voted: UP => AI Win
      (Number(round?.closePrice) > Number(round?.lockPrice) &&
        Number(round.AIPrice) > Number(round.lockPrice)) ||
      // Result: DOWN, AI Voted: DOWN => AI Win
      (Number(round?.closePrice) < Number(round?.lockPrice) &&
        Number(round.AIPrice) < Number(round.lockPrice)) ||
      // Result: SAME, AI Voted: SAME => AI Win
      (Number(round?.closePrice) === Number(round?.lockPrice) &&
        Number(round.AIPrice) === Number(round.lockPrice))
    ) {
      // Follow AI wins
      roundResultPosition = BetPosition.BULL;
    } else {
      // Against AI wins
      roundResultPosition = BetPosition.BEAR;
    }
  } else {
    roundResultPosition =
      Number(round?.closePrice) > Number(round?.lockPrice)
        ? BetPosition.BULL
        : BetPosition.BEAR;
  }

  return bet.position === roundResultPosition ? Result.WIN : Result.LOSE;
};

export const getMultiplier = (total: number, amount: number) => {
  if (total === 0 || amount === 0) {
    return 0;
  }

  return total / amount;
};

/**
 * Calculates the total payout given a bet
 */
export const getPayout = (bet: Bet, rewardRate = 1) => {
  if (!bet || !bet.round) {
    return 0;
  }

  const { bullAmount, bearAmount, totalAmount } = bet.round;
  const multiplier = getMultiplier(
    totalAmount,
    bet.position === BetPosition.BULL ? bullAmount : bearAmount
  );
  return bet.amount * multiplier * rewardRate;
};

export const getNetPayout = (bet: Bet, rewardRate = 1): number => {
  if (!bet || !bet.round) {
    return 0;
  }

  const payout = getPayout(bet, rewardRate);
  return payout - bet.amount;
};
