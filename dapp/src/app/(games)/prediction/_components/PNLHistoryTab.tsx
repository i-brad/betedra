import { formatHBAR } from "@/helpers";
import {
  getMultiplier,
  getNetPayout,
  getRoundResult,
  Result,
} from "@/helpers/rounds";
import useTokenUsdPriceBigNumber from "@/hooks/useTokenUsdPriceBigNumber";
import { REWARD_RATE } from "@/state/predictions/config";
import { Bet, BetPosition } from "@/state/types";
import { cn } from "@/utils";
import React from "react";
import SummaryRow from "./SummaryRow";

interface PnlTabProps {
  bets: Bet[];
  currentEpoch: number;
}

interface PnlCategory {
  rounds: number;
  amount: number;
}

interface PnlSummary {
  won: PnlCategory & {
    payout: number;
    bestRound: { id: string; payout: number; multiplier: number };
  };
  lost: PnlCategory;
  entered: PnlCategory;
}

const initialPnlSummary: PnlSummary = {
  won: {
    rounds: 0,
    amount: 0,
    payout: 0, // net payout after all dHBARctions
    bestRound: {
      id: "0",
      payout: 0, // net payout after all dHBARctions
      multiplier: 0,
    },
  },
  lost: {
    rounds: 0,
    amount: 0,
  },
  entered: {
    rounds: 0,
    amount: 0,
  },
};

const getPnlSummary = (bets: Bet[], currentEpoch: number): PnlSummary => {
  return bets.reduce((summary: PnlSummary, bet) => {
    const roundResult = getRoundResult(bet, currentEpoch);
    if (roundResult === Result.WIN) {
      const payout = getNetPayout(bet, REWARD_RATE);
      let { bestRound } = summary.won;
      if (payout > bestRound.payout && bet.round) {
        const { bullAmount, bearAmount, totalAmount } = bet.round;
        const multiplier = getMultiplier(
          totalAmount,
          bet.position === BetPosition.BULL ? bullAmount : bearAmount
        );
        bestRound = { id: bet.round.epoch.toString(), payout, multiplier };
      }
      return {
        won: {
          rounds: summary.won.rounds + 1,
          amount: summary.won.amount + bet.amount,
          payout: summary.won.payout + payout,
          bestRound,
        },
        entered: {
          rounds: summary.entered.rounds + 1,
          amount: summary.entered.amount + bet.amount,
        },
        lost: summary.lost,
      };
    }
    if (roundResult === Result.LOSE || roundResult === Result.HOUSE) {
      return {
        lost: {
          rounds: summary.lost.rounds + 1,
          amount: summary.lost.amount + bet.amount,
        },
        entered: {
          rounds: summary.entered.rounds + 1,
          amount: summary.entered.amount + bet.amount,
        },
        won: summary.won,
      };
    }
    // Ignore Canceled and Live rounds
    return summary;
  }, initialPnlSummary);
};

const PNLHistoryTab = ({ bets, currentEpoch }: PnlTabProps) => {
  const summary = getPnlSummary(bets, currentEpoch);
  const tokenPrice = useTokenUsdPriceBigNumber();

  const netResultAmount = summary.won.payout - summary.lost.amount;
  const netResultIsPositive = netResultAmount > 0;
  const avgPositionEntered = summary.entered.amount / summary.entered.rounds;
  const avgHBARWonPerRound = netResultAmount / summary.entered.rounds;
  const avgHBARWonIsPositive = avgHBARWonPerRound > 0;

  // Guard in case user has only lost rounds
  const hasBestRound = summary.won.bestRound.payout !== 0;

  const netResultInUsd = tokenPrice.times(netResultAmount).toNumber();
  const avgHBARWonInUsd = tokenPrice.times(avgHBARWonPerRound).toNumber();
  const avgHBARWonInUsdDisplay = !Number.isNaN(avgHBARWonInUsd)
    ? `~${avgHBARWonInUsd.toFixed(2)}`
    : "~$0.00";
  const betRoundInUsd = tokenPrice
    .times(summary.won.bestRound.payout)
    .toNumber();
  const avgPositionEnteredInUsd = tokenPrice
    .times(avgPositionEntered)
    .toNumber();
  const avgPositionEnteredInUsdDisplay = !Number.isNaN(avgPositionEnteredInUsd)
    ? `~${avgPositionEnteredInUsd.toFixed(2)}`
    : "~$0.00";

  return (
    <div className="space-y-5 py-4 border-t border-blue-gray-200">
      <div className="space-y-3 border-b border-blue-gray-200 pb-6">
        <div className="flex items-start justify-between">
          <h3 className="text-sm lg:text-base mb-1 text-blue-gray-500">
            Net results
          </h3>
          <span className="block text-right">
            <p
              className={cn(
                "text-sm font-medium lg:text-base text-success-500",
                {
                  "text-error-400": !netResultIsPositive,
                }
              )}
            >
              {`${netResultIsPositive ? "+" : ""}${formatHBAR(
                netResultAmount,
                3
              )} HBAR`}
            </p>
            <p className="text-xs text-blue-gray-500">
              {" "}
              {`~$${netResultInUsd.toFixed(2)}`}
            </p>
          </span>
        </div>
        <div className="flex items-start justify-between">
          <h3 className="text-sm lg:text-base mb-1 text-blue-gray-500">
            Average return / round
          </h3>
          <span className="block text-right">
            <p
              className={cn(
                "text-sm font-medium lg:text-base text-success-500",
                {
                  "text-error-400": !avgHBARWonIsPositive,
                }
              )}
            >
              {`${avgHBARWonIsPositive ? "+" : ""}${formatHBAR(
                avgHBARWonPerRound,
                3
              )} HBAR`}
            </p>
            <p className="text-xs text-blue-gray-500">
              {avgHBARWonInUsdDisplay}
            </p>
          </span>
        </div>
        {hasBestRound ? (
          <div className="flex items-start justify-between">
            <h3 className="text-sm lg:text-base mb-1 text-blue-gray-500">
              Best round: {summary.won.bestRound.id}
            </h3>
            <span className="block text-right">
              <p
                className={cn(
                  "text-sm font-medium lg:text-base text-success-500"
                )}
              >
                {`${formatHBAR(summary.won.bestRound.payout, 3)} HBAR`}
              </p>
              <p className="text-xs text-blue-gray-500">
                {" "}
                {`~$${betRoundInUsd.toFixed(2)}`}
              </p>
            </span>
          </div>
        ) : null}
        <div className="flex items-start justify-between">
          <h3 className="text-sm lg:text-base mb-1 text-blue-gray-500">
            Average position entered
          </h3>
          <span className="block text-right">
            <p
              className={cn(
                "text-sm font-medium lg:text-base text-success-500"
              )}
            >
              {`${formatHBAR(avgPositionEntered, 3)} HBAR`}
            </p>
            <p className="text-xs text-blue-gray-500">
              {avgPositionEnteredInUsdDisplay}
            </p>
          </span>
        </div>
      </div>
      <div className="space-y-3">
        <SummaryRow type="won" summary={summary} tokenPrice={tokenPrice} />
        <SummaryRow type="lost" summary={summary} tokenPrice={tokenPrice} />
        <SummaryRow type="entered" summary={summary} tokenPrice={tokenPrice} />
      </div>
    </div>
  );
};

export default PNLHistoryTab;
