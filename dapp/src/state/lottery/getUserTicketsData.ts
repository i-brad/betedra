import { provider } from "@/providers/wagmi/config";
import LotteryABI from "@/smart-contract/abi/lottery";
import { Contract } from "ethers";
import { Address } from "viem";
import { TICKET_LIMIT_PER_REQUEST } from "./constants";
import { LotteryTicket } from "./types";

const address = process.env.NEXT_PUBLIC_LOTTERY_ADDRESS as `0x${string}`;
const lotteryContract = new Contract(address, LotteryABI, provider);

export const processRawTicketsResponse = (
  ticketsResponse: any
): LotteryTicket[] => {
  const [ticketIds, ticketNumbers, ticketStatuses] = ticketsResponse;

  if (ticketIds?.length > 0) {
    return ticketIds.map((ticketId: number, index: number) => {
      return {
        id: ticketId.toString(),
        number: ticketNumbers[index].toString(),
        status: ticketStatuses[index],
      };
    });
  }
  return [];
};

export const viewUserInfoForLotteryId = async (
  account: string,
  lotteryId: string,
  cursor: number,
  perRequestLimit: number
): Promise<LotteryTicket[] | null> => {
  try {
    const data = await lotteryContract.viewUserInfoForLotteryId([
      account as Address,
      BigInt(lotteryId),
      BigInt(cursor),
      BigInt(perRequestLimit),
    ]);
    return processRawTicketsResponse(data);
  } catch (error) {
    console.error("viewUserInfoForLotteryId", error);
    return null;
  }
};

export const fetchUserTicketsForOneRound = async (
  account: string,
  lotteryId: string
): Promise<LotteryTicket[]> => {
  let cursor = 0;
  let numReturned = TICKET_LIMIT_PER_REQUEST;
  const ticketData: LotteryTicket[] = [];

  while (numReturned === TICKET_LIMIT_PER_REQUEST) {
    const response = await viewUserInfoForLotteryId(
      account,
      lotteryId,
      cursor,
      TICKET_LIMIT_PER_REQUEST
    );

    cursor += TICKET_LIMIT_PER_REQUEST;
    if (response) {
      numReturned = response.length;
      ticketData.push(...response);
    }
  }

  return ticketData;
};

export const fetchUserTicketsForMultipleRounds = async (
  idsToCheck: string[],
  account: string
): Promise<{ roundId: string; userTickets: LotteryTicket[] }[]> => {
  const results = await Promise.all(
    idsToCheck.map((roundId) =>
      Promise.all([
        Promise.resolve(roundId),
        fetchUserTicketsForOneRound(account, roundId),
      ])
    )
  );

  return results.map((result) => {
    const [roundId, ticketsForRound] = result;
    return {
      roundId,
      userTickets: ticketsForRound,
    };
  });
};
