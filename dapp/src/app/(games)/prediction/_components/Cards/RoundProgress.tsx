import { cn } from "@/utils";
import React from "react";

interface RoundProgressProps {
  lockTimestamp: number;
  closeTimestamp: number;
}

const RoundProgress = ({
  lockTimestamp,
  closeTimestamp,
}: RoundProgressProps) => {
  const startMs = lockTimestamp * 1000;
  const endMs = closeTimestamp * 1000;
  const now = Date.now();
  const rawProgress = ((now - startMs) / (endMs - startMs)) * 100;
  const progress = rawProgress <= 100 ? rawProgress : 100;
  return (
    <span
      className={cn(
        "mb-4 h-[0.3125rem] bg-blue-gray-200 rounded-3xl block w-full"
      )}
    >
      <span
        style={{
          width: `${progress}%`,
        }}
        className="h-full block rounded-3xl bg-blue-500"
      ></span>
    </span>
  );
};

export default RoundProgress;
