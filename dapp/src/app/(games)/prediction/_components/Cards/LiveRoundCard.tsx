import VideoIcon from "@/components/custom_icons/VideoIcon";
import { getHasRoundFailed, getPriceDifference } from "@/helpers";
import { getNowInSeconds } from "@/hooks/useCountdown";
import usePollOraclePrice from "@/hooks/usePollOraclePrice";
import { BetPosition, NodeLedger, NodeRound } from "@/state/types";
import {
  cn,
  formatBigIntToFixed,
  formatBigIntToFixedNumber,
  formatPriceDifference,
} from "@/utils";
import { formatUnits } from "ethers";
import React, { useEffect, useMemo, useState } from "react";
import CountUp from "react-countup";
import { FaArrowDownLong } from "react-icons/fa6";
import CalculatingRoundCard from "./CalculatingRoundCard";
import CancelledRoundCard from "./CancelledRoundCard";
import RoundProgress from "./RoundProgress";

interface LiveRoundCardProps {
  round: NodeRound;
  betAmount?: NodeLedger["amount"];
  hasEnteredUp: boolean;
  hasEnteredDown: boolean;
  bullMultiplier: string;
  bearMultiplier: string;
}

const REFRESH_PRICE_BEFORE_SECONDS_TO_CLOSE = 2;

const SHOW_HOUSE_BEFORE_SECONDS_TO_CLOSE = 20;

const LiveRoundCard = ({
  round,
  hasEnteredUp,
  hasEnteredDown,
  bullMultiplier,
  bearMultiplier,
}: LiveRoundCardProps) => {
  const { lockPrice, totalAmount, closeTimestamp, epoch, lockTimestamp } =
    round;
  const bufferSeconds = 60;

  const { blockPrice, price, refetch } = usePollOraclePrice();

  const [isCalculatingPhase, setIsCalculatingPhase] = useState(false);

  const isHouse = useMemo(() => {
    const secondsToClose = closeTimestamp
      ? closeTimestamp - getNowInSeconds()
      : 0;
    return Boolean(
      lockPrice &&
        Number(blockPrice) === Number(lockPrice) &&
        secondsToClose <= SHOW_HOUSE_BEFORE_SECONDS_TO_CLOSE
    );
  }, [closeTimestamp, lockPrice, blockPrice]);

  const isBull = Boolean(
    lockPrice &&
      formatBigIntToFixedNumber(blockPrice.toString()) >
        formatBigIntToFixedNumber(lockPrice?.toString())
  );

  const betPosition = isHouse
    ? BetPosition.HOUSE
    : isBull
    ? BetPosition.BULL
    : BetPosition.BEAR;

  const priceDifference = useMemo(
    () => getPriceDifference((blockPrice as any) ?? 0n, lockPrice ?? 0n),
    [lockPrice, blockPrice]
  );
  // console.log({ priceDifference, blockPrice, lockPrice });
  const hasRoundFailed = getHasRoundFailed(
    round.oracleCalled,
    round.closeTimestamp,
    bufferSeconds,
    round?.closePrice
  );

  useEffect(() => {
    const secondsToClose = closeTimestamp
      ? closeTimestamp - getNowInSeconds()
      : 0;
    if (secondsToClose > 0) {
      const refreshPriceTimeout = setTimeout(() => {
        refetch?.();
      }, (secondsToClose - REFRESH_PRICE_BEFORE_SECONDS_TO_CLOSE) * 1000);

      const calculatingPhaseTimeout = setTimeout(() => {
        setIsCalculatingPhase(true);
      }, secondsToClose * 1000);

      return () => {
        clearTimeout(refreshPriceTimeout);
        clearTimeout(calculatingPhaseTimeout);
      };
    }
    return undefined;
  }, [refetch, closeTimestamp]);

  if (hasRoundFailed) {
    return <CancelledRoundCard round={round} betPosition={betPosition} />;
  }

  if (isCalculatingPhase) {
    return (
      <CalculatingRoundCard
        round={round}
        hasEnteredDown={hasEnteredDown}
        hasEnteredUp={hasEnteredUp}
        betPosition={
          Number(blockPrice) === Number(lockPrice)
            ? BetPosition.HOUSE
            : betPosition
        }
        bearMultiplier={bearMultiplier}
        bullMultiplier={bullMultiplier}
      />
    );
  }

  const priceWhenUp =
    isHouse || Number(blockPrice) === Number(lockPrice) ? null : isBull;

  const increased = formatBigIntToFixedNumber(priceDifference?.toString()) > 0;

  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-b p-[0.0625rem] rounded-[0.625rem] from-blue-500 via-[#4690F9] to-purple-500">
      <div
        className={cn(
          "w-full relative z-30 rounded-[0.625rem] bg-blue-gray-100 px-5 pt-3 pb-4 drop-shadow-container backdrop-blur-xs"
        )}
      >
        <span
          className={`flex items-center mb-[0.6875rem] text-gray-50 justify-between w-full`}
        >
          <span className="flex items-center space-x-[0.5rem]">
            <span className="flex items-center space-x-[0.3125rem]">
              <VideoIcon />
              <span
                className={cn("text-sm text-blue-gray-900 block capitalize")}
              >
                Live
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
        {/* progress */}

        <RoundProgress
          closeTimestamp={closeTimestamp ?? 0}
          lockTimestamp={lockTimestamp ?? 0}
        />

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
            <h5 className="text-xs text-blue-gray-500 mb-0.5">Last Price</h5>
            <span className="flex items-center justify-between mb-[1.125rem]">
              <CountUp
                start={0}
                preserveValue
                delay={0}
                end={price}
                prefix="$"
                decimals={4}
                duration={1}
              >
                {({ countUpRef }) => (
                  <span className="text-lg lg:text-2xl font-medium text-blue-gray-900">
                    <span ref={countUpRef} />
                  </span>
                )}
              </CountUp>
              {Number(priceDifference) !== 0 ? (
                <span
                  className={cn("flex items-center space-x-0.5", {
                    "text-error-400": !increased,
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
                  {lockPrice
                    ? formatBigIntToFixed(lockPrice?.toString(), 4)
                    : 0}
                </span>
              </span>
              <span className="block text-right">
                <span className="text-blue-gray-500 block mb-1">
                  Prize Pool
                </span>
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
      </div>
    </div>
  );
};

export default LiveRoundCard;
