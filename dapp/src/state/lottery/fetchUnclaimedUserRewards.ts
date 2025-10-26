import { provider } from "@/providers/wagmi/config";
import LotteryABI from "@/smart-contract/abi/lottery";
import { BIG_ZERO } from "@/utils/bigNumber";
import BigNumber from "bignumber.js";
import { Contract } from "ethers";
import { CONTRACT_ADDRESS } from "./constants";
import { LotteryTicket, LotteryTicketClaimData, UserRoundProps } from "./types";

interface RoundDataAndUserTickets {
  roundId: string;
  userTickets: LotteryTicket[];
  finalNumber: string;
}

const lotteryAddress = CONTRACT_ADDRESS;
const lotteryContract = new Contract(lotteryAddress, LotteryABI, provider);

const fetchHbarRewardsForTickets = async (
  winningTickets: LotteryTicket[]
): Promise<{
  ticketsWithUnclaimedRewards: LotteryTicket[];
  hbarTotal: BigNumber;
}> => {
  try {
    // Run all contract calls in parallel
    const hbarRewards: bigint[] = await Promise.all(
      winningTickets.map(async (winningTicket) => {
        const { roundId, id, rewardBracket } = winningTicket;
        return lotteryContract.viewRewardsForTicketId(
          BigInt(roundId || 0),
          BigInt(id),
          rewardBracket
        );
      })
    );

    // Sum up rewards
    const hbarTotal = hbarRewards.reduce<BigNumber>(
      (accum, reward) => accum.plus(new BigNumber(reward.toString())),
      BIG_ZERO
    );

    // Attach rewards to tickets
    const ticketsWithUnclaimedRewards = winningTickets.map((ticket, index) => ({
      ...ticket,
      hbarReward: hbarRewards[index].toString(),
    }));

    return { ticketsWithUnclaimedRewards, hbarTotal };
  } catch (error) {
    console.error(error);
    return { ticketsWithUnclaimedRewards: [], hbarTotal: BIG_ZERO };
  }
};

const getRewardBracketByNumber = (
  ticketNumber: string,
  finalNumber: string
): number => {
  // Winning numbers are evaluated right-to-left in the smart contract, so we reverse their order for validation here:
  // i.e. '1123456' should be evaluated as '6543211'
  const ticketNumAsArray = ticketNumber.split("").reverse();
  const winningNumsAsArray = finalNumber.split("").reverse();
  const matchingNumbers: string[] = [];

  // The number at index 6 in all tickets is 1 and will always match, so finish at index 5
  for (let index = 0; index < winningNumsAsArray.length - 1; index++) {
    if (ticketNumAsArray[index] !== winningNumsAsArray[index]) {
      break;
    }
    matchingNumbers.push(ticketNumAsArray[index]);
  }

  // Reward brackets refer to indexes, 0 = 1 match, 5 = 6 matches. Deduct 1 from matchingNumbers' length to get the reward bracket
  const rewardBracket = matchingNumbers.length - 1;
  return rewardBracket;
};

export const getWinningTickets = async (
  roundDataAndUserTickets: RoundDataAndUserTickets
): Promise<LotteryTicketClaimData | null> => {
  const { roundId, userTickets, finalNumber } = roundDataAndUserTickets;

  const ticketsWithRewardBrackets = userTickets.map((ticket) => {
    return {
      roundId,
      id: ticket.id,
      number: ticket.number,
      status: ticket.status,
      rewardBracket: getRewardBracketByNumber(ticket.number, finalNumber),
    };
  });

  // A rewardBracket of -1 means no matches. 0 and above means there has been a match
  const allWinningTickets = ticketsWithRewardBrackets.filter((ticket) => {
    return ticket.rewardBracket >= 0;
  });

  // If ticket.status is true, the ticket has already been claimed
  const unclaimedWinningTickets = allWinningTickets.filter((ticket) => {
    return !ticket.status;
  });

  if (
    Array.isArray(unclaimedWinningTickets) &&
    unclaimedWinningTickets.length > 0
  ) {
    const { ticketsWithUnclaimedRewards, hbarTotal } =
      await fetchHbarRewardsForTickets(unclaimedWinningTickets);
    return {
      ticketsWithUnclaimedRewards,
      allWinningTickets,
      hbarTotal,
      roundId,
    };
  }

  if (allWinningTickets.length > 0) {
    return {
      ticketsWithUnclaimedRewards: [],
      allWinningTickets,
      hbarTotal: BIG_ZERO,
      roundId,
    };
  }

  return null;
};

const fetchUnclaimedUserRewards = async (
  rounds: UserRoundProps[]
): Promise<LotteryTicketClaimData[]> => {
  if (rounds.length === 0) {
    return [];
  }

  const winningRounds = await Promise.all(
    rounds.map(async ({ round, userTickets }) => {
      return getWinningTickets({
        roundId: round.lotteryId,
        userTickets,
        finalNumber: round.finalNumber,
      });
    })
  );

  // Flatten & filter out null values
  return winningRounds
    .flat()
    .filter((ticket): ticket is LotteryTicketClaimData => ticket !== null);
};
export default fetchUnclaimedUserRewards;
