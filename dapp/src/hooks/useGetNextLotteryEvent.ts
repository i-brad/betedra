import { LotteryStatus } from "@/state/lottery/types";
import { useMemo } from "react";

interface LotteryEvent {
  nextEventTime?: number;
  postCountdownText?: string;
  preCountdownText?: string;
}

const vrfRequestTime = 180; // 3 mins
const secondsBetweenRounds = 300; // 5 mins
const transactionResolvingBuffer = 30; // Delay countdown by 30s to ensure contract transactions have been calculated and broadcast

const useGetNextLotteryEvent = (
  endTime?: number,
  status?: LotteryStatus
): LotteryEvent => {
  return useMemo(() => {
    // Current lottery is active
    if (!endTime || !status) {
      return {
        nextEventTime: undefined,
        preCountdownText: undefined,
        postCountdownText: undefined,
      };
    }
    if (status === LotteryStatus.OPEN) {
      return {
        nextEventTime: endTime + transactionResolvingBuffer,
        preCountdownText: "Next draw starts in",
        postCountdownText: "until the draw",
      };
    }
    // Current lottery has finished but not yet claimable
    if (status === LotteryStatus.CLOSE) {
      return {
        nextEventTime: endTime + transactionResolvingBuffer + vrfRequestTime,
        preCountdownText: "Winners announced in",
        postCountdownText: undefined,
      };
    }
    // Current lottery claimable. Next lottery has not yet started
    if (status === LotteryStatus.CLAIMABLE) {
      return {
        nextEventTime:
          endTime + transactionResolvingBuffer + secondsBetweenRounds,
        preCountdownText: "Tickets on sale in",
        postCountdownText: undefined,
      };
    }
    return {
      nextEventTime: undefined,
      preCountdownText: undefined,
      postCountdownText: undefined,
    };
  }, [endTime, status]);
};

export default useGetNextLotteryEvent;
