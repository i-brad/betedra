import { provider } from "@/providers/wagmi/config";
import LotteryABI from "@/smart-contract/abi/lottery";
import { processViewLotterySuccessResponse } from "@/state/lottery/helpers";
import { LotteryResponse } from "@/state/lottery/types";
import { Contract } from "ethers";
import { useEffect, useState } from "react";
import useGetCurrentLotteryId from "./useGetCurrentLotteryId";

const FIRST_LOTTERY_ID = 1;

const address = process.env.NEXT_PUBLIC_LOTTERY_ADDRESS as `0x${string}`;

const useLotteryHistory = () => {
  const { currentLotteryId, ...lotteryData } = useGetCurrentLotteryId();
  const [latestId, setLatestId] = useState<number | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [round, setRound] = useState<LotteryResponse | null>(null);

  useEffect(() => {
    if (!currentLotteryId) return;
    if (currentLotteryId && currentLotteryId > 1) {
      setLatestId(currentLotteryId - 1);
    }
  }, [currentLotteryId]);

  useEffect(() => {
    if (latestId) {
      const getLotteryUsingLatestId = async () => {
        try {
          setLoading(true);
          const lotteryContract = new Contract(address, LotteryABI, provider);

          const lottery = await lotteryContract.viewLottery(latestId);
          const round = processViewLotterySuccessResponse(
            lottery,
            latestId.toString()
          );
          setRound(round);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

      getLotteryUsingLatestId();
    }
  }, [latestId]);

  const previous = () => {
    if (latestId === FIRST_LOTTERY_ID) return;
    setLatestId((prev) => {
      if (prev) --prev;
      return prev;
    });
  };

  const next = () => {
    if (!currentLotteryId) return;
    if (latestId === currentLotteryId - 1) return;
    setLatestId((prev) => {
      if (prev) ++prev;
      return prev;
    });
  };

  const goToLatest = () => {
    if (!currentLotteryId) return;
    setLatestId(currentLotteryId - 1);
  };

  if (!currentLotteryId) {
    return {
      next,
      previous,
      goToLatest,
      latestId,
      isLoading: lotteryData?.isLoading || isLoading,
      round,
      isPrevDisabled: true,
      isNextDisabled: true,
      currentLotteryId,
    };
  }

  return {
    next,
    previous,
    goToLatest,
    latestId,
    isLoading,
    round,
    isPrevDisabled: latestId === FIRST_LOTTERY_ID,
    isNextDisabled: latestId === currentLotteryId - 1,
    currentLotteryId,
  };
};

export default useLotteryHistory;
