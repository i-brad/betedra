import TicketIcon from "@/components/custom_icons/TicketIcon";
import useHBarPrice from "@/hooks/useHBarPrice";
import { LotteryResponse } from "@/state/lottery/types";
import { currencyFormatter } from "@/utils";
import { BIG_ZERO } from "@/utils/bigNumber";
import BigNumber from "bignumber.js";
import React, { useEffect, useMemo, useState } from "react";

interface MatchCardProps {
  amount: number;
  rewardBracket: number;
  numberWinners?: string;
}

export const MatchCard = ({
  rewardBracket,
  amount,
  numberWinners,
}: MatchCardProps) => {
  const wHbarPrice = useHBarPrice();
  const amountInUsd = useMemo(() => {
    if (amount && wHbarPrice) {
      return wHbarPrice * amount;
    }
    return 0;
  }, [wHbarPrice, amount]);
  return (
    <div>
      <h5 className="mb-1 text-base font-medium text-transparent bg-clip-text bg-gradient-to-b from-blue-500 via-dodger-blue to-purple-500">
        Match {rewardBracket < 6 ? "first" : "all"} {rewardBracket}
      </h5>
      <span>
        <h5 className="text-lg font-bold leading-4 text-blue-gray-900">
          {amount} HBAR
        </h5>
        <span className="block mb-1 text-xs text-blue-gray-600">
          ~{currencyFormatter(amountInUsd)}
        </span>
        {Number(numberWinners) ? (
          <span className="flex items-center text-blue-gray-600 text-[0.625rem] space-x-0.5">
            <TicketIcon />
            <span>
              {numberWinners} winning{" "}
              {Number(numberWinners) > 1 ? "tickets" : "ticket"}
            </span>
          </span>
        ) : null}
      </span>
    </div>
  );
};

interface RewardsState {
  isLoading: boolean;
  rewardsLessTreasuryFee: BigNumber;
  rewardsBreakdown: string[] | null;
  countWinnersPerBracket: string[] | null;
}

const rewardBrackets = [0, 1, 2, 3, 4, 5];

const RewardBrackets = ({ round }: { round: LotteryResponse }) => {
  const [state, setState] = useState<RewardsState>({
    isLoading: true,
    rewardsLessTreasuryFee: BIG_ZERO,
    rewardsBreakdown: null,
    countWinnersPerBracket: null,
  });

  useEffect(() => {
    if (round) {
      const {
        amountCollectedInWHbar,
        rewardsBreakdown,
        countWinnersPerBracket,
      } = round;

      const amountLessTreasuryFee = new BigNumber(amountCollectedInWHbar);
      setState({
        isLoading: false,
        rewardsLessTreasuryFee: amountLessTreasuryFee,
        rewardsBreakdown,
        countWinnersPerBracket,
      });
    } else {
      setState({
        isLoading: true,
        rewardsLessTreasuryFee: BIG_ZERO,
        rewardsBreakdown: null,
        countWinnersPerBracket: null,
      });
    }
  }, [round]);

  const getHBarRewards = (bracket: number) => {
    if (!state.rewardsBreakdown) return BIG_ZERO;

    const shareAsPercentage = new BigNumber(
      state.rewardsBreakdown[bracket]
    ).div(100);
    return state.rewardsLessTreasuryFee
      .div(100)
      .times(shareAsPercentage)
      .toFixed(2);
  };
  return (
    <div className="w-full grid grid-cols-2 gap-y-[1.4375rem] md:grid-cols-3 place-content-between">
      {rewardBrackets.map((bracketIndex) => (
        <MatchCard
          key={bracketIndex}
          rewardBracket={bracketIndex + 1}
          amount={Number(getHBarRewards(bracketIndex)) || 0}
          numberWinners={round.countWinnersPerBracket[bracketIndex]}
        />
      ))}
    </div>
  );
};

export default RewardBrackets;
