import LotteryABI from "@/smart-contract/abi/lottery";
import { useReadContract } from "wagmi";

const address = process.env.NEXT_PUBLIC_LOTTERY_ADDRESS as `0x${string}`;

const useGetCurrentLotteryId = () => {
  const { data, refetch, isLoading } = useReadContract({
    address,
    abi: LotteryABI,
    functionName: "currentLotteryId",
  });

  return {
    currentLotteryId: Number(data),
    refetchCurrentLotteryId: refetch,
    isLoading,
  };
};

export default useGetCurrentLotteryId;
