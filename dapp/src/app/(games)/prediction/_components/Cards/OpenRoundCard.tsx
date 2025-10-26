import ForwardIcon from "@/components/custom_icons/ForwardIcon";
import PrimaryButton from "@/components/shared/Buttons";
import { getNowInSeconds } from "@/hooks/useCountdown";
import { BetPosition, NodeLedger, NodeRound } from "@/state/types";
import { cn } from "@/utils";
import { formatUnits } from "ethers";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaArrowDownLong } from "react-icons/fa6";
import { useAccount } from "wagmi";
import SetPositionRoundCard from "./SetPositionRoundCard";

interface OpenRoundCardProps {
  round: NodeRound;
  betAmount?: NodeLedger["amount"];
  hasEnteredUp: boolean;
  hasEnteredDown: boolean;
  bullMultiplier: string;
  bearMultiplier: string;
  refreshLedger?: any;
}

interface State {
  isSettingPosition: boolean;
  position: BetPosition;
}

const AVERAGE_CHAIN_BLOCK_TIMES = 5.687;
const TRANSACTION_BUFFER_BLOCKS = 3;

const OpenRoundCard = ({
  round,
  bullMultiplier,
  bearMultiplier,
  hasEnteredDown,
  hasEnteredUp,
  refreshLedger,
}: OpenRoundCardProps) => {
  const { address: account } = useAccount();
  const { epoch, totalAmount } = round;
  const [state, setState] = useState<State>({
    isSettingPosition: false,
    position: BetPosition.BULL,
  });

  const { lockTimestamp } = round ?? { lockTimestamp: null };
  const { isSettingPosition, position } = state;
  const [isBufferPhase, setIsBufferPhase] = useState(false);

  const positionEnteredText = useMemo(
    () => (hasEnteredUp ? "UP" : hasEnteredDown ? "DOWN" : null),
    [hasEnteredUp, hasEnteredDown]
  );

  useEffect(() => {
    const secondsToLock = lockTimestamp ? lockTimestamp - getNowInSeconds() : 0;
    if (secondsToLock > 0) {
      const setIsBufferPhaseTimeout = setTimeout(() => {
        setIsBufferPhase(true);
      }, (secondsToLock - AVERAGE_CHAIN_BLOCK_TIMES * TRANSACTION_BUFFER_BLOCKS) * 1000);

      return () => {
        clearTimeout(setIsBufferPhaseTimeout);
      };
    }
    return undefined;
  }, [lockTimestamp]);

  const canEnterPosition = useMemo(() => {
    if (hasEnteredUp || hasEnteredDown) {
      return false;
    }

    if (round.lockPrice !== null) {
      return false;
    }

    return true;
  }, [hasEnteredUp, hasEnteredDown, round?.lockPrice]);

  const handleBack = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      isSettingPosition: false,
    }));
  }, []);

  const handleSetPosition = useCallback((newPosition: BetPosition) => {
    setState((prevState) => ({
      ...prevState,
      isSettingPosition: true,
      position: newPosition,
    }));
  }, []);

  const togglePosition = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      position:
        prevState.position === BetPosition.BULL
          ? BetPosition.BEAR
          : BetPosition.BULL,
    }));
  }, []);

  const handleSuccess = useCallback(async () => {
    if (account) {
      // console.log({ hash });
      refreshLedger?.();
      // handleBack();
    }
  }, [account, refreshLedger]);

  if (isSettingPosition && !isBufferPhase) {
    return (
      <SetPositionRoundCard
        onBack={handleBack}
        onSuccess={handleSuccess}
        position={position}
        togglePosition={togglePosition}
        epoch={round.epoch}
      />
    );
  }

  return (
    <div className="relative isolate overflow-hidden">
      <div
        className={cn(
          "w-full relative z-30 rounded-[0.625rem] border border-blue-gray-200 bg-blue-gray-100 px-4 pt-3 pb-5 drop-shadow-container backdrop-blur-xs"
        )}
      >
        <span className={`flex items-center mb-2 justify-between w-full`}>
          <span className="flex items-center space-x-[0.3125rem]">
            <ForwardIcon />
            <span className={cn("text-sm text-blue-gray-900 block capitalize")}>
              UP NEXT
            </span>
          </span>
          <span className="text-xs text-blue-gray-700">#{epoch}</span>
        </span>

        <span className="bg-blue-gray-200 block rounded-[1.5rem] w-full h-[0.3125rem] mb-5" />

        <div>
          {/* up */}
          <span className="block point-up bg-blue-gray-200 h-[3.875rem] rounded-t-full text-center">
            <h4 className="text-sm text-success-500 font-medium">Up</h4>
            {Number(bullMultiplier) ? (
              <p className="text-xs text-blue-gray-400">
                {bullMultiplier}x Payout
              </p>
            ) : null}
          </span>

          {!positionEnteredText ? (
            <div className="border-2 rounded-lg p-4 border-success-400">
              <span className="block mb-[1.125rem] items-center justify-between">
                <span className="text-xs block mb-1 text-blue-gray-500">
                  Prize Pool
                </span>
                <span className="text-sm text-blue-gray-900 font-medium leading-6 inline-block">
                  {totalAmount
                    ? Number(formatUnits(totalAmount, 8))?.toFixed(3)
                    : 0}{" "}
                  HBAR
                </span>
              </span>

              <span className="flex items-center gap-3.5 justify-between">
                <PrimaryButton
                  text="Enter UP"
                  disabled={!canEnterPosition || isBufferPhase}
                  onClick={() => handleSetPosition(BetPosition.BULL)}
                  className={cn(
                    "bg-success-500 text-success-25 green border-success-100 !text-xs w-full whitespace-nowrap py-[0.625rem]"
                  )}
                />
                <PrimaryButton
                  text="Enter DOWN"
                  disabled={!canEnterPosition || isBufferPhase}
                  onClick={() => handleSetPosition(BetPosition.BEAR)}
                  className={cn(
                    "bg-error-500 text-error-25 border-error-100 red !text-xs w-full whitespace-nowrap py-[0.625rem]"
                  )}
                />
              </span>
            </div>
          ) : (
            <span className="flex border rounded-sm text-blue-gray-900 justify-between border-blue-gray-200 px-2 py-[0.4375rem]">
              <span className="flex items-center space-x-1 text-sm">
                {positionEnteredText ? (
                  <FaArrowDownLong
                    size={14}
                    className={cn("text-error-400", {
                      "rotate-180 text-success-300":
                        positionEnteredText === "UP",
                    })}
                  />
                ) : null}
                <span>{positionEnteredText} entered</span>
              </span>
              <span className="text-right text-base">
                {totalAmount
                  ? Number(formatUnits(totalAmount, 8))?.toFixed(3)
                  : 0}{" "}
                HBAR
              </span>
            </span>
          )}

          {/* down */}
          <span className="block point-down bg-blue-gray-200 h-[3.875rem] pb-4 rounded-b-full text-center">
            <h4 className="text-sm text-error-500 font-medium">Down</h4>

            {Number(bearMultiplier) ? (
              <p className="text-xs text-blue-gray-400">
                {bearMultiplier}x Payout
              </p>
            ) : null}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OpenRoundCard;
