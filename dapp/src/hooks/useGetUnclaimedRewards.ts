import fetchUnclaimedUserRewards from "@/state/lottery/fetchUnclaimedUserRewards";
import { LotteryTicketClaimData } from "@/state/lottery/types";
import { FetchStatus, TFetchStatus } from "@/state/types";
import useLotteryTransitionStore from "@/store/useLotteryTransitionStore";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import useGetCurrentLotteryId from "./useGetCurrentLotteryId";
import useGetUserLotteryData from "./useGetUserLotteryData";

const useGetUnclaimedRewards = () => {
  const { address: account } = useAccount();
  const { currentLotteryId } = useGetCurrentLotteryId();
  const { lotteries } = useGetUserLotteryData(currentLotteryId);
  const { isTransitioning } = useLotteryTransitionStore();
  const [fetchStatus, setFetchStatus] = useState<TFetchStatus>(
    FetchStatus.Idle
  );
  const [unclaimedRewards, setUnclaimedRewards] = useState<
    LotteryTicketClaimData[]
  >([]);

  useEffect(() => {
    // Reset on account change and round transition
    setFetchStatus(FetchStatus.Idle);
  }, [account, isTransitioning]);

  const fetchAllRewards = async () => {
    if (!account) return;
    if (lotteries.length === 0) {
      setFetchStatus(FetchStatus.Fetched);
      return;
    }
    setFetchStatus(FetchStatus.Fetching);
    const unclaimedRewardsResponse = await fetchUnclaimedUserRewards(lotteries);
    setUnclaimedRewards(unclaimedRewardsResponse);
    setFetchStatus(FetchStatus.Fetched);
  };

  const reset = () => {
    setUnclaimedRewards([])
  }

  return { currentLotteryId, reset, fetchAllRewards, unclaimedRewards, fetchStatus };
};

export default useGetUnclaimedRewards;
