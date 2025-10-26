import VideoIcon from "@/components/custom_icons/VideoIcon";
import { BetPosition, NodeRound } from "@/state/types";
import { cn } from "@/utils";
import Image from "next/image";
import React from "react";

interface CalculatingCardProps {
  round: NodeRound;
  hasEnteredUp: boolean;
  hasEnteredDown: boolean;
  betPosition: BetPosition | null;
  bullMultiplier: string;
  bearMultiplier: string;
}

const CalculatingRoundCard = ({
  round,
  betPosition,
  bearMultiplier,
  bullMultiplier,
  hasEnteredDown,
  hasEnteredUp,
}: CalculatingCardProps) => {
  const { epoch } = round;

  const priceWhenUp =
    betPosition === BetPosition.HOUSE ? null : betPosition == BetPosition.BULL;

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
          <span className="flex items-center space-x-[0.3125rem]">
            <span className="flex items-center space-x-[0.3125rem]">
              <VideoIcon />
              <span className={cn("text-sm text-blue-gray-900 block")}>
                Calculating
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
                "border-success-400 bg-success-25": priceWhenUp,
                "border-error-500 bg-error-25":
                  !priceWhenUp && priceWhenUp !== null,
              }
            )}
          >
            <div className="flex items-center flex-col py-[0.46875rem] space-y-5 justify-center">
              <Image
                src="/svgs/betedra-icon.svg"
                alt="Icon"
                width={23.54}
                height={38}
              />
              <h4 className="text-sm text-blue-gray-900 font-medium">
                Calculating...
              </h4>
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

export default CalculatingRoundCard;
