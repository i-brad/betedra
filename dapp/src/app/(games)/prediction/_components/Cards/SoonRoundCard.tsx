import TimerIcon from "@/components/custom_icons/TimerIcon";
import useCountdown from "@/hooks/useCountdown";
import { NodeRound } from "@/state/types";
import { cn } from "@/utils";
import React from "react";

interface SoonRoundCardProps {
  round: NodeRound;
}

const SoonRoundCard = ({ round }: SoonRoundCardProps) => {
  const { timeLeft } = useCountdown(round?.startTimestamp ?? 0);

  return (
    <div className="relative isolate overflow-hidden">
      <div
        className={cn(
          "w-full relative z-30 rounded-[0.625rem] border border-blue-gray-200 bg-blue-gray-100 px-5 pb-4 pt-3 drop-shadow-container backdrop-blur-xs"
        )}
      >
        <span
          className={`flex items-center mb-2 text-gray-50 justify-between w-full`}
        >
          <span className="flex items-center space-x-[0.3125rem]">
            <TimerIcon />
            <span className={cn("text-sm text-blue-gray-900 block capitalize")}>
              Later
            </span>
          </span>
          <span className="text-xs text-blue-gray-700">#{round?.epoch}</span>
        </span>
        <span className="bg-blue-gray-200 block rounded-[1.5rem] w-full h-[0.3125rem] mb-5" />

        <div>
          {/* up */}
          <span className="block point-up bg-blue-gray-200 h-[3.875rem] rounded-t-full text-center">
            <h4 className="text-sm text-success-500 font-medium">Up</h4>
          </span>

          <div className="p-4 border-2 border-blue-gray-200 bg-white rounded-lg text-center">
            <h6 className="text-xs mb-1 text-blue-gray-500">
              This entry starts in
            </h6>
            <span className="block font-medium text-blue-gray-900 text-sm">
              {timeLeft}
            </span>
          </div>
          <span className="block point-down bg-blue-gray-200 h-[3.875rem] rounded-b-full text-center">
            <h4 className="text-sm text-error-500 font-medium">Down</h4>
          </span>
        </div>
      </div>
    </div>
  );
};

export default SoonRoundCard;
