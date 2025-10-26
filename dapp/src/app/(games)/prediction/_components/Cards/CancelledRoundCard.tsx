import TimerIcon from "@/components/custom_icons/TimerIcon";
import PrimaryButton from "@/components/shared/Buttons";
import useIsRefundable from "@/hooks/useIsRefundable";
import PredictionsABI from "@/smart-contract/abi/prediction";
import { BetPosition, NodeRound } from "@/state/types";
import { cn, formatBigIntToFixed } from "@/utils";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";
import { useAccount, useWriteContract } from "wagmi";

interface CanceledRoundCardProps {
  round: NodeRound;
  betPosition: BetPosition | null;
}

const address = process.env.NEXT_PUBLIC_PREDICTION_ADDRESS as `0x${string}`;

const CancelledRoundCard = ({ round, betPosition }: CanceledRoundCardProps) => {
  const { epoch, lockPrice } = round;
  const { address: account } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const { isRefundable, setIsRefundable } = useIsRefundable(epoch);

  const priceWhenUp =
    betPosition === BetPosition.HOUSE ? null : betPosition == BetPosition.BULL;

  const reclaimHandler = async () => {
    const epoch = round?.epoch;
    const args: any = [[epoch]];

    if (!account) {
      toast.error("Please connect a wallet", {
        className: "toast-error",
      });
      return;
    }

    try {
      const response = await writeContractAsync({
        abi: PredictionsABI,
        address,
        account,
        functionName: "claim",
        args,
      });

      if (typeof response === "string") {
        setIsRefundable(false);

        toast.success("Reclaim successfully", {
          className: "toast-success",
        });
      }
    } catch (error: any) {
      // console.error(error, "failed");
      toast.error(
        error?.shortMessage || error?.message || "Failed to reclaim position",
        {
          className: "toast-error",
        }
      );
    }
  };

  return (
    <div className="relative isolate overflow-hidden">
      <div
        className={cn(
          "w-full relative z-30 rounded-[0.625rem] border border-blue-gray-200 bg-blue-gray-100 px-5 pb-4 pt-3"
        )}
      >
        <span
          className={`flex items-center mb-5 text-gray-50 justify-between w-full`}
        >
          <span className="flex items-center space-x-[0.3125rem]">
            <TimerIcon />
            <span className={cn("text-sm text-blue-gray-900 block capitalize")}>
              Cancelled
            </span>
          </span>
          <span className="text-xs text-blue-gray-700">#{epoch}</span>
        </span>

        <div>
          {/* up */}
          <span
            className={cn(
              `block point-up bg-blue-gray-200 h-[3.875rem] rounded-t-full text-center `,
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
            <span className="block space-y-1 mb-[1.125rem] text-blue-gray-900">
              <span className="text-base lg:text-lg block font-medium">
                Round Cancelled
              </span>
              {isRefundable ? (
                <PrimaryButton
                  disabled={isPending}
                  text={isPending ? "Reclaiming..." : "Reclaim position"}
                  onClick={reclaimHandler}
                />
              ) : null}
              <Link
                href="https://betedra.gitbook.io/docs/play/prediction/how-to-use-prediction"
                target="_blank"
                className="underline text-sm text-blue-500"
              >
                Learn more
              </Link>
            </span>
            <span className="block">
              <span className="text-blue-gray-500 block mb-1 text-xs">
                Locked Price
              </span>
              <span className="text-blue-gray-800 text-sm">
                {lockPrice ? formatBigIntToFixed(lockPrice?.toString(), 4) : 0}
              </span>
            </span>
          </div>

          {/* down */}
          <span
            className={cn(
              `block point-down bg-blue-gray-200 h-[3.875rem] pb-4 rounded-b-full text-center `,
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
          </span>
        </div>
      </div>
    </div>
  );
};

export default CancelledRoundCard;
