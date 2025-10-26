import { getHasRoundFailed } from "@/helpers";
import { Bet, BetPosition } from "@/state/types";
import { PredictionsRoundsResponse } from "@/utils/types";
import { formatUnits } from "ethers";
import { useAccount } from "wagmi";
import useGetClaimStatuses from "./useGetClaimStatuses";
import useGetRoundsData from "./useGetRoundsData";
import useRounds from "./useRounds";
import useRoundsLength from "./useRoundsLength";

const useGetHistory = (page = 1) => {
  const { address: account } = useAccount();
  const { length: userRoundsLength } = useRoundsLength();

  const { rounds: userRounds, maxPages } = useRounds(page, userRoundsLength);

  const epochs = !userRounds
    ? []
    : Object.keys(userRounds).map((epochStr) => Number(epochStr));
  const roundData = useGetRoundsData(epochs ? epochs : []);

  const claimableStatuses = useGetClaimStatuses(epochs ? epochs : [], account!);

  const emptyResult = {
    maxPages,
    bets: [],
    claimableStatuses: {},
    totalHistory: userRoundsLength,
  };

  if (userRoundsLength === 0) {
    return emptyResult;
  }

  if (!userRounds || !roundData) {
    return emptyResult;
  }

  const bufferSeconds = 60;

  // Turn the data from the node into a Bet object that comes from the graph
  const bets: Bet[] = roundData.reduce(
    (accum: any, round: PredictionsRoundsResponse) => {
      const ledger = userRounds[Number(round.epoch)];
      const ledgerAmount = BigInt(ledger.amount);
      const closePrice = round.closePrice;
      const lockPrice = round.lockPrice;
      const AIPrice = round.AIPrice
        ? parseFloat(formatUnits(round.AIPrice, 8))
        : null;

      const getRoundPosition = () => {
        if (!closePrice) {
          return null;
        }

        // If not AI-based prediction
        if (Number(round.closePrice) === Number(round.lockPrice)) {
          return BetPosition.HOUSE;
        }

        return Number(round.closePrice) > Number(round.lockPrice)
          ? BetPosition.BULL
          : BetPosition.BEAR;
      };

      return [
        ...accum,
        {
          id: null,
          hash: null,
          amount: parseFloat(formatUnits(ledgerAmount, 8)),
          position: ledger.position,
          claimed: ledger.claimed,
          claimedAt: null,
          claimedHash: null,
          claimedHBAR: 0,
          claimedNetHBAR: 0,
          createdAt: null,
          updatedAt: null,
          block: 0,
          round: {
            id: null,
            epoch: Number(round.epoch),
            failed: getHasRoundFailed(
              round.oracleCalled,
              round.closeTimestamp === 0n ? null : Number(round.closeTimestamp),
              bufferSeconds,
              round.closePrice
            ),
            startBlock: null,
            startAt: round.startTimestamp ? Number(round.startTimestamp) : null,
            startHash: null,
            lockAt: round.lockTimestamp ? Number(round.lockTimestamp) : null,
            lockBlock: null,
            lockPrice,
            lockHash: null,
            lockRoundId: round.lockOracleId
              ? round.lockOracleId.toString()
              : null,
            closeRoundId: round.closeOracleId
              ? round.closeOracleId.toString()
              : null,
            closeHash: null,
            closeAt: null,
            closePrice,
            closeBlock: null,
            totalBets: 0,
            totalAmount: parseFloat(formatUnits(round.totalAmount, 8)),
            bullBets: 0,
            bullAmount: parseFloat(formatUnits(round.bullAmount, 8)),
            bearBets: 0,
            bearAmount: parseFloat(formatUnits(round.bearAmount, 8)),
            position: getRoundPosition(),
            AIPrice,
          },
        },
      ];
    },
    []
  );

  return {
    maxPages,
    bets,
    claimableStatuses,
    page,
    totalHistory: Number(userRoundsLength),
  };
};

export default useGetHistory;
