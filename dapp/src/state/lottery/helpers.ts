import { bigIntToSerializedBigNumber } from "@/utils/bigNumber";
import { LotteryResponse, LotteryStatus, LotteryTicket } from "./types";

export const processViewLotterySuccessResponse = (
  response: any,
  lotteryId: string
): LotteryResponse => {
  const {
    status,
    startTime,
    endTime,
    priceTicketInWHbar,
    discountDivisor,
    treasuryFee,
    firstTicketId,
    amountCollectedInWHbar,
    finalNumber,
    hbarPerBracket,
    countWinnersPerBracket,
    rewardsBreakdown,
  } = response;

  const statusKey = Object.keys(LotteryStatus)[status];
  const serializedHbarPerBracket = hbarPerBracket.map((hbarPerBracket: any) => {
    const amount = Number(bigIntToSerializedBigNumber(hbarPerBracket));
    if (amount > 0) {
      return amount / 1e8;
    }
    return amount;
  });
  const serializedCountWinnersPerBracket = countWinnersPerBracket.map(
    (winnersInBracket: any) => bigIntToSerializedBigNumber(winnersInBracket)
  );
  const serializedRewardsBreakdown = rewardsBreakdown.map((reward: any) =>
    bigIntToSerializedBigNumber(reward)
  );

  return {
    isLoading: false,
    lotteryId,
    status: LotteryStatus[statusKey as keyof typeof LotteryStatus],
    startTime: startTime?.toString(),
    endTime: endTime?.toString(),
    priceTicketInWHbar: (
      Number(bigIntToSerializedBigNumber(priceTicketInWHbar)) / 1e8
    ).toString(),
    discountDivisor: discountDivisor?.toString(),
    treasuryFee: (Number(treasuryFee?.toString()) / 100).toString(),
    firstTicketId: firstTicketId?.toString(),
    amountCollectedInWHbar: (
      Number(bigIntToSerializedBigNumber(amountCollectedInWHbar)) / 1e8
    ).toFixed(2),
    finalNumber: finalNumber?.toString(),
    hbarPerBracket: serializedHbarPerBracket,
    countWinnersPerBracket: serializedCountWinnersPerBracket,
    rewardsBreakdown: serializedRewardsBreakdown,
  };
};

export const processViewLotteryErrorResponse = (
  lotteryId: string
): LotteryResponse => {
  return {
    isLoading: true,
    lotteryId,
    status: LotteryStatus.PENDING,
    startTime: "",
    endTime: "",
    priceTicketInWHbar: "",
    discountDivisor: "",
    treasuryFee: "",
    firstTicketId: "",
    amountCollectedInWHbar: "",
    finalNumber: "0",
    hbarPerBracket: [],
    countWinnersPerBracket: [],
    rewardsBreakdown: [],
  };
};

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

export const parseRetrievedNumber = (number: string): string => {
  const numberAsArray = number.split("");
  numberAsArray.splice(0, 1);
  numberAsArray.reverse();
  return numberAsArray.join("");
};

export const getRoundIdArray = (
  lotteryIds: number[],
  currentLotteryId?: number
) => {
  if (!currentLotteryId) return [];
  return lotteryIds.filter((lotteryId) => lotteryId !== currentLotteryId);
};
