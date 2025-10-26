"use client";
import PrimaryButton from "@/components/shared/Buttons";
import { ConnectWallet } from "@/components/shared/ConnectWallet";
import useGetUnclaimedRewards from "@/hooks/useGetUnclaimedRewards";
import { FetchStatus } from "@/state/types";
import useLotteryTransitionStore from "@/store/useLotteryTransitionStore";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import ClaimPrizes from "./ClaimPrizes";

const CheckStatus = () => {
  const { isTransitioning } = useLotteryTransitionStore();
  const { isConnected, address: account } = useAccount();
  const [hasCheckedForRewards, setHasCheckedForRewards] = useState(false);
  const [hasRewardsToClaim, setHasRewardsToClaim] = useState(false);
  const {
    fetchAllRewards,
    reset,
    unclaimedRewards,
    fetchStatus,
    currentLotteryId,
  } = useGetUnclaimedRewards();
  const isFetchingRewards = fetchStatus === FetchStatus.Fetching;

  useEffect(() => {
    if (fetchStatus === FetchStatus.Fetched) {
      // Manage showing unclaimed rewards modal once per page load / once per lottery state change
      if (unclaimedRewards.length > 0 && !hasCheckedForRewards) {
        setHasRewardsToClaim(true);
        setHasCheckedForRewards(true);
        //  onPresentClaimModal()
      }

      if (unclaimedRewards.length === 0 && !hasCheckedForRewards) {
        setHasRewardsToClaim(false);
        setHasCheckedForRewards(true);
      }
    }
  }, [unclaimedRewards, hasCheckedForRewards, fetchStatus]);

  useEffect(() => {
    // Clear local state on account change, or when lottery isTransitioning state changes
    setHasRewardsToClaim(false);
    setHasCheckedForRewards(false);
  }, [account, isTransitioning]);

  const texts = useMemo(() => {
    if (!isConnected) {
      return (
        <div>
          <h3 className="text-base font-semibold mb-[0.3125rem]">
            Gotten tickets?
          </h3>
          <h4 className="font-bold text-2xl mb-8">
            Connect your wallet to check if you&apos;ve won!
          </h4>
        </div>
      );
    }

    if (hasCheckedForRewards && !hasRewardsToClaim) {
      return (
        <div>
          <h3 className="text-base font-semibold mb-[0.3125rem]">
            No prizes to collect
          </h3>
          <h4 className="font-bold text-2xl mb-8">Better luck next time!</h4>
        </div>
      );
    }

    if (hasCheckedForRewards && hasRewardsToClaim) {
      return (
        <div>
          <h3 className="text-base font-semibold mb-[0.3125rem]">
            Why not play again?
          </h3>
          <h4 className="font-bold text-2xl mb-8">Congratulations!</h4>
        </div>
      );
    }

    return (
      <div>
        <h3 className="text-base font-semibold mb-[0.3125rem]">
          Gotten tickets?
        </h3>
        <h4 className="font-bold text-2xl mb-8">Check if you’re a winner</h4>
      </div>
    );
  }, [hasCheckedForRewards, hasRewardsToClaim, isConnected]);

  return (
    <section className="bg-purple-500 flex isolate items-center relative justify-center py-[4.375rem]">
      <Image
        src="/svgs/radial-sun-burst-2.svg"
        alt="Radial Sun burst"
        fill
        className="object-bottom object-cover absolute -z-10 top-0 left-0 w-full h-full"
      />
      <div className="text-center text-blue-gray-25">
        {texts}
        {isConnected ? (
          hasRewardsToClaim ? (
            <ClaimPrizes
              roundsToClaim={unclaimedRewards}
              onSuccess={() => {
                reset();
                setHasCheckedForRewards(false);
                setHasRewardsToClaim(false);
              }}
            />
          ) : (
            <PrimaryButton
              onClick={fetchAllRewards}
              text="Check now"
              className="max-w-[12.125rem]"
              disabled={isFetchingRewards || !currentLotteryId}
              disabledText={currentLotteryId ? "Checking..." : ""}
            />
          )
        ) : (
          <ConnectWallet>
            <PrimaryButton
              as="span"
              text="Connect wallet"
              className="w-fit mx-auto"
            />
          </ConnectWallet>
        )}
      </div>
    </section>
  );
};

export default CheckStatus;
