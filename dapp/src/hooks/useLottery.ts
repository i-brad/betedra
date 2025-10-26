import LotteryABI from "@/smart-contract/abi/lottery";
import { TICKET_LIMIT_PER_REQUEST } from "@/state/lottery/constants";
import {
  processRawTicketsResponse,
  processViewLotterySuccessResponse,
} from "@/state/lottery/helpers";
import { useAccount, useReadContract } from "wagmi";
import useGetLotteryData from "./useGetLotteryData";
import { LotteryTicket } from "@/state/lottery/types";

const contract_address = process.env
  .NEXT_PUBLIC_LOTTERY_ADDRESS as `0x${string}`;

const useLottery = () => {
  const { address } = useAccount();
  const { currentLotteryId, ...lotteryData } = useGetLotteryData();
  const { data, refetch } = useReadContract({
    address: contract_address,
    abi: LotteryABI,
    functionName: "viewLottery",
    args: [currentLotteryId?.toString()],
    query: {
      enabled: !!currentLotteryId,
    },
  });

  const { data: userLotteryRes } = useReadContract({
    address: contract_address,
    abi: LotteryABI,
    functionName: "viewUserInfoForLotteryId",
    args: [address, currentLotteryId?.toString(), 0, TICKET_LIMIT_PER_REQUEST],
    query: {
      enabled: !!currentLotteryId && !!address,
    },
  });

  let userTickets: LotteryTicket[] = [];

  if (userLotteryRes) {
    userTickets = processRawTicketsResponse(userLotteryRes);
  }

  if (!currentLotteryId || !data)
    return {
      currentRound: null,
      currentLotteryId,
      refetch,
      ...lotteryData,
      userTickets,
    };

  return {
    currentLotteryId,
    currentRound: processViewLotterySuccessResponse(
      data,
      currentLotteryId.toString()
    ),
    ...lotteryData,
    refetch,
    userTickets,
  };
};

export default useLottery;
