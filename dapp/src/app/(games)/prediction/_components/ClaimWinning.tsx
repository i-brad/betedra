import PrimaryButton from "@/components/shared/Buttons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PredictionsABI from "@/smart-contract/abi/prediction";
import { NodeRound } from "@/state/types";
import { currencyFormatter, formatBigIntToFixedNumber } from "@/utils";
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";
import { useAccount, useWriteContract } from "wagmi";
import { updateLeaderboard } from "../../../actions/leaderboard";

interface Props {
  disabled?: boolean;
  round: NodeRound;
  betAmount: number;
}

const address = process.env.NEXT_PUBLIC_PREDICTION_ADDRESS as `0x${string}`;

export function ClaimWinning({ round, betAmount, disabled }: Props) {
  const [claimed, setClaimed] = useState(disabled);
  const { address: account } = useAccount();
  const amount = betAmount;

  const rate = round?.closePrice
    ? formatBigIntToFixedNumber(round?.closePrice?.toString() ?? "0")
    : 1;

  const { writeContractAsync, isPending, isSuccess } = useWriteContract();

  const claimHandler = async () => {
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
        setClaimed(true);
        await updateLeaderboard({
          address: account,
          totalRoundsWon: 1,
          winnings: amount,
          winningsInUsd: amount * rate,
        });
        toast.success("Claim successfully", {
          className: "toast-success",
        });
      }
    } catch (error: any) {
      // console.error(error, "failed");
      toast.error(error?.shortMessage || error?.message || "Failed to claim", {
        className: "toast-error",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <PrimaryButton
          disabled={claimed || isSuccess}
          text={claimed || isSuccess ? "Claimed" : "Claim earning"}
          className="ring-[#334058] text-sm"
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[17.9375rem] bg-white rounded-2xl py-8 px-6 text-mine-shaft">
        <DialogHeader>
          <DialogTitle className="sr-only">Claim Winning</DialogTitle>
        </DialogHeader>
        <div>
          <h2 className="font-semibold text-base text-center mb-1 lg:leading-8">
            Claim your Winnings
          </h2>
          <Image
            src="/svgs/trophy.svg"
            alt="Trophy"
            width={89}
            height={84}
            className="mx-auto mb-1"
          />
          <div className="mb-[1.75rem] flex justify-between">
            <span className="block w-fit">
              <span className="text-xs text-blue-gray-500 block mb-1">
                Round
              </span>
              <span className="text-blue-gray-900 text-sm">
                #{round?.epoch}
              </span>
            </span>
            <span className="block w-fit">
              <span className="text-xs text-blue-gray-500 block mb-1">
                Amount to claim
              </span>
              <span className="text-blue-gray-900 text-sm">
                {amount} HBAR{" "}
                <span className="text-blue-gray-500 text-xs font-medium">
                  ~{currencyFormatter(amount * rate, 2)}
                </span>
              </span>
            </span>
          </div>
          <PrimaryButton
            disabled={isPending || isSuccess}
            text={
              isPending ? "Claiming..." : isSuccess ? "Claimed" : "Claim now"
            }
            onClick={claimHandler}
            className="max-h-[2.75rem]"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ClaimWinning;
