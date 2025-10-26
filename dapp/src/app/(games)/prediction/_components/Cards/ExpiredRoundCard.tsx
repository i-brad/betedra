import TimerIcon from "@/components/custom_icons/TimerIcon";
import {
  getHasRoundFailed,
  getPriceDifference,
  getRoundPosition,
} from "@/helpers";
import useIsClaimable from "@/hooks/useIsClaimable";
import { BetPosition, NodeLedger, NodeRound } from "@/state/types";
import {
  cn,
  formatBigIntToFixed,
  formatBigIntToFixedNumber,
  formatPriceDifference,
} from "@/utils";
import { formatUnits } from "ethers";
import React from "react";
import { FaArrowDownLong } from "react-icons/fa6";
import CalculatingRoundCard from "./CalculatingRoundCard";
import CancelledRoundCard from "./CancelledRoundCard";
import CollectWinningsOverlay from "./CollectWinningsOverlay";

interface ExpiredRoundCardProps {
  round: NodeRound;
  betAmount?: NodeLedger["amount"];
  hasEnteredUp: boolean;
  hasEnteredDown: boolean;
  hasClaimedUp: boolean;
  hasClaimedDown: boolean;
  bullMultiplier: string;
  bearMultiplier: string;
  isActive?: boolean;
}

const ExpiredRoundCard = ({
  round,
  betAmount,
  hasEnteredUp,
  hasEnteredDown,
  hasClaimedUp,
  hasClaimedDown,
  bullMultiplier,
  bearMultiplier,
}: ExpiredRoundCardProps) => {
  const { epoch, lockPrice, closePrice, totalAmount } = round;

  const priceDifference = getPriceDifference(closePrice ?? 0n, lockPrice ?? 0n);

  const isClaimable = useIsClaimable(epoch);

  const betPosition = getRoundPosition(lockPrice ?? 0n, closePrice ?? 0n);
  const bufferSeconds = 60;
  const hasRoundFailed = getHasRoundFailed(
    round.oracleCalled,
    round.closeTimestamp,
    bufferSeconds,
    round?.closePrice ? BigInt(round?.closePrice) : 0n
  );

  if (hasRoundFailed) {
    return <CancelledRoundCard round={round} betPosition={betPosition} />;
  }

  if (!closePrice) {
    return (
      <CalculatingRoundCard
        round={round}
        hasEnteredDown={hasEnteredDown}
        hasEnteredUp={hasEnteredUp}
        betPosition={betPosition}
        bearMultiplier={bearMultiplier}
        bullMultiplier={bullMultiplier}
      />
    );
  }

  const priceWhenUp =
    betPosition === BetPosition.HOUSE ? null : betPosition == BetPosition.BULL;

  const increased = formatBigIntToFixedNumber(priceDifference?.toString()) > 0;

  return (
    <div
      className={cn(
        "w-full relative isolate overflow-hidden opacity-60 hover:opacity-100 z-30 rounded-[0.625rem] border border-blue-gray-200 bg-blue-gray-100 px-5 pb-4 pt-3"
      )}
    >
      <span className={`flex items-center mb-2 justify-between w-full`}>
        <span className="flex items-center space-x-[0.5rem]">
          <span className="flex items-center space-x-[0.3125rem]">
            <TimerIcon />
            <span className={cn("text-sm text-blue-gray-900 block capitalize")}>
              Expired
            </span>
          </span>
          {hasEnteredUp || hasEnteredDown ? (
            <span className="flex space-x-[0.3125rem] items-center text-xs leading-4 text-blue-gray-900 bg-blue-gray-200 rounded-full px-2 py-0.5">
              <span className="block size-[0.375rem] rounded-full bg-purple-500" />
              <span>Entered - {hasEnteredUp ? "UP" : "DOWN"}</span>
            </span>
          ) : null}
        </span>
        <span className="text-xs text-blue-gray-700">#{epoch}</span>
      </span>

      <span className="bg-blue-500 block rounded-[1.5rem] w-full h-[0.3125rem] mb-5" />

      <div>
        {/* up */}
        <span
          className={cn(
            `block point-up bg-blue-gray-200 h-[3.875rem] rounded-t-full text-center`,
            {
              "bg-success-400": priceWhenUp,
            }
          )}
        >
          <h4
            className={cn("text-sm text-success-500 font-medium", {
              "text-white": priceWhenUp,
            })}
          >
            Up
          </h4>

          {Number(bullMultiplier) ? (
            <p
              className={cn("text-xs text-blue-gray-400", {
                "text-success-50": priceWhenUp,
              })}
            >
              {bullMultiplier}x Payout
            </p>
          ) : null}
        </span>

        <div
          className={cn(
            "border-2 border-blue-gray-200 bg-white rounded-lg p-4",
            {
              "border-success-400": priceWhenUp,
              "border-error-500": !priceWhenUp && priceWhenUp !== null,
            }
          )}
        >
          <h5 className="text-xs text-blue-gray-500 mb-0.5">Closed Price</h5>
          <span className="flex items-center justify-between mb-[1.125rem]">
            <span className="text-lg font-medium text-blue-gray-900">
              {closePrice ? formatBigIntToFixed(closePrice?.toString(), 4) : 0}
            </span>
            {Number(priceDifference) !== 0 ? (
              <span
                className={cn("flex items-center space-x-0.5", {
                  "text-error-500": !increased,
                  "text-success-300": increased,
                })}
              >
                <FaArrowDownLong
                  size={14}
                  className={cn({
                    "rotate-180": increased,
                  })}
                />
                <span className="text-sm">
                  {priceDifference
                    ? formatPriceDifference(priceDifference?.toString(), 4)
                    : 0}
                </span>
              </span>
            ) : null}
          </span>
          <div className="space-y-0.5 text-xs flex items-start justify-between">
            <span className="block">
              <span className="text-blue-gray-500 block mb-1">
                Locked Price
              </span>
              <span className="text-blue-gray-800 text-sm">
                {lockPrice ? formatBigIntToFixed(lockPrice?.toString(), 4) : 0}
              </span>
            </span>
            <span className="block text-right">
              <span className="text-blue-gray-500 block mb-1">Prize Pool</span>
              <span className="text-blue-gray-800 font-medium text-sm">
                {totalAmount
                  ? Number(formatUnits(totalAmount, 8))?.toFixed(3)
                  : 0}{" "}
                HBAR
              </span>
            </span>
          </div>
        </div>

        {/* down */}
        <span
          className={cn(
            `block point-down bg-blue-gray-200 h-[3.875rem] pb-4 rounded-b-full text-center`,
            {
              "bg-error-500": !priceWhenUp && priceWhenUp !== null,
            }
          )}
        >
          <h4
            className={cn("text-sm text-error-500 font-medium", {
              "text-error-25": !priceWhenUp && priceWhenUp !== null,
            })}
          >
            Down
          </h4>

          {Number(bearMultiplier) ? (
            <p
              className={cn("text-xs text-blue-gray-400", {
                "text-blue-gray-50": !priceWhenUp && priceWhenUp !== null,
              })}
            >
              {bearMultiplier}x Payout
            </p>
          ) : null}
        </span>
      </div>
      {Number(betAmount) > 0 && priceWhenUp === hasEnteredUp && isClaimable ? (
        <CollectWinningsOverlay
          disabled={hasClaimedDown || hasClaimedUp}
          round={round}
          multiplier={
            priceWhenUp === hasEnteredUp ? bullMultiplier : bearMultiplier
          }
          betAmount={betAmount}
          position={hasEnteredUp ? "UP" : "DOWN"}
        />
      ) : null}
    </div>
  );
};

export default ExpiredRoundCard;
