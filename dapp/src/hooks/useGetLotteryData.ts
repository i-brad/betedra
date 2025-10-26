import LotteryABI from "@/smart-contract/abi/lottery";
import BigNumber from "bignumber.js";
import { useReadContracts } from "wagmi";

const address = process.env.NEXT_PUBLIC_LOTTERY_ADDRESS as `0x${string}`;

const useGetLotteryData = () => {
  const {
    data: contractsResponse,
    refetch,
    isLoading,
  } = useReadContracts({
    contracts: [
      {
        address,
        abi: LotteryABI,
        functionName: "currentLotteryId",
      },
      {
        address,
        abi: LotteryABI,
        functionName: "currentTicketId",
      },
      {
        address,
        abi: LotteryABI,
        functionName: "minPriceTicketInWHbar",
      },
      {
        address,
        abi: LotteryABI,
        functionName: "maxPriceTicketInWHbar",
      },
      {
        address,
        abi: LotteryABI,
        functionName: "maxNumberTicketsPerBuyOrClaim",
      },
    ],
    allowFailure: false,
  });

  if (!contractsResponse)
    return {
      currentLotteryId: null,
      maxNumberTicketsPerBuyOrClaim: new BigNumber(1),
      refetchLotteryData: refetch,
      isLoading,
    };

  const currentLotteryId = Number(contractsResponse[0]);
  const currentTicketId = Number(contractsResponse[1]);
  const minPriceTicketInWHbar = Number(contractsResponse[2]) / 1e8;
  const maxPriceTicketInWHbar = Number(contractsResponse[3]) / 1e8;
  const maxNumberTicketsPerBuyOrClaim = new BigNumber(
    Number(contractsResponse[4])
  );

  return {
    currentLotteryId,
    currentTicketId,
    minPriceTicketInWHbar,
    maxPriceTicketInWHbar,
    maxNumberTicketsPerBuyOrClaim,
    refetchLotteryData: refetch,
    isLoading,
  };
};

export default useGetLotteryData;
