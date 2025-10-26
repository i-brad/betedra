import PrimaryButton from "@/components/shared/Buttons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useGetLotteryData from "@/hooks/useGetLotteryData";
import useHBarPrice from "@/hooks/useHBarPrice";
import LotteryABI from "@/smart-contract/abi/lottery";
import { CONTRACT_ADDRESS } from "@/state/lottery/constants";
import { LotteryTicket, LotteryTicketClaimData } from "@/state/lottery/types";
import { currencyFormatter } from "@/utils";
import { getBalanceAmount } from "@/utils/formatBalance";
import React, { useState } from "react";
import { toast } from "sonner";
import { useAccount, useWriteContract } from "wagmi";

type Ticket = {
  ticketIds: string[];
  brackets: Array<number | undefined>;
};

const ClaimWinnings = ({
  roundsToClaim,
  onSuccess,
}: {
  roundsToClaim: LotteryTicketClaimData[];
  onSuccess?: () => void;
}) => {
  const { address: account } = useAccount();
  const [isOpen, setOpen] = useState(false);
  const { maxNumberTicketsPerBuyOrClaim } = useGetLotteryData();
  const [activeClaimIndex, setActiveClaimIndex] = useState(0);
  const { isPending: pendingTx, writeContractAsync } = useWriteContract();
  const [pendingBatchClaims, setPendingBatchClaims] = useState(
    Math.ceil(
      roundsToClaim[activeClaimIndex].ticketsWithUnclaimedRewards.length /
        maxNumberTicketsPerBuyOrClaim.toNumber()
    )
  );
  const activeClaimData = roundsToClaim[activeClaimIndex];

  const hbarPrice = useHBarPrice();
  const hbarReward = activeClaimData.hbarTotal;
  const dollarReward = hbarReward.times(hbarPrice);
  const rewardAsBalance = getBalanceAmount(hbarReward, 8).toFixed(3);
  const dollarRewardAsBalance = getBalanceAmount(dollarReward, 8).toNumber();

  const parseUnclaimedTicketDataForClaimCall = (
    ticketsWithUnclaimedRewards: LotteryTicket[],
    lotteryId: string
  ) => {
    const ticketIds = ticketsWithUnclaimedRewards.map((ticket) => {
      return ticket.id;
    });
    const brackets = ticketsWithUnclaimedRewards.map((ticket) => {
      return ticket.rewardBracket;
    });
    return { lotteryId, ticketIds, brackets };
  };

  const claimTicketsCallData = parseUnclaimedTicketDataForClaimCall(
    activeClaimData.ticketsWithUnclaimedRewards,
    activeClaimData.roundId
  );

  const shouldBatchRequest = maxNumberTicketsPerBuyOrClaim.lt(
    claimTicketsCallData.ticketIds.length
  );

  const handleProgressToNextClaim = () => {
    if (roundsToClaim.length > activeClaimIndex + 1) {
      // If there are still rounds to claim, move onto the next claim
      setActiveClaimIndex(activeClaimIndex + 1);
    } else {
      onSuccess?.();
      setOpen(false);
    }
  };

  const getTicketBatches = (
    ticketIds: string[],
    brackets: Array<number | undefined>
  ): Ticket[] => {
    const requests: Ticket[] = [];
    const maxAsNumber = maxNumberTicketsPerBuyOrClaim.toNumber();

    for (let i = 0; i < ticketIds.length; i += maxAsNumber) {
      const ticketIdsSlice = ticketIds.slice(i, maxAsNumber + i);
      const bracketsSlice = brackets.slice(i, maxAsNumber + i);
      requests.push({ ticketIds: ticketIdsSlice, brackets: bracketsSlice });
    }

    return requests;
  };

  const handleClaim = async () => {
    const { lotteryId, ticketIds, brackets } = claimTicketsCallData;
    try {
      const receipt = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        account,
        functionName: "claimTickets",
        abi: LotteryABI,
        args: [Number(lotteryId), ticketIds.map(Number), brackets.map(Number)],
      });

      if (receipt) {
        toast("Winnings Collected!", {
          className: "toast-success",
          description: `Your HBAR winnings for round ${lotteryId} have been sent to your wallet`,
        });
        handleProgressToNextClaim();
      }
    } catch {
      toast("Failed to claim winnings", {
        className: "toast-error",
      });
    }
  };

  const handleBatchClaim = async () => {
    const { lotteryId, ticketIds, brackets } = claimTicketsCallData;
    const ticketBatches = getTicketBatches(ticketIds, brackets);
    const transactionsToFire = ticketBatches.length;
    const receipts: string[] = [];
    for (const ticketBatch of ticketBatches) {
      try {
        const receipt = await writeContractAsync({
          address: CONTRACT_ADDRESS,
          account,
          functionName: "claimTickets",
          abi: LotteryABI,
          args: [
            Number(lotteryId),
            ticketBatch.ticketIds.map(Number),
            ticketBatch.brackets.map(Number),
          ],
        });

        if (receipt) {
          // One transaction within batch has succeeded
          receipts.push(receipt);
          setPendingBatchClaims(transactionsToFire - receipts.length);

          // More transactions are to be done within the batch. Issue toast to give user feedback.
          if (receipts.length !== transactionsToFire) {
            toast("Winnings Collected!", {
              className: "toast-success",
              description: `Claim ${receipts.length} of ${transactionsToFire} for round ${lotteryId} was successful. Please confirm the next transaction`,
            });
          }
        } else {
          break;
        }
      } catch {
        toast("Failed to claim winnings", {
          className: "toast-error",
        });
      }
    }

    // Batch is finished
    if (receipts.length === transactionsToFire) {
      toast("Winnings Collected!", {
        className: "toast-success",
        description: `Your HBAR winnings for round #${lotteryId} have been sent to your wallet`,
      });
      handleProgressToNextClaim();
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={(value) => setOpen(value)}>
      <DialogTrigger asChild>
        <PrimaryButton text="Claim rewards" className="max-w-[12.125rem]" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[20.4375rem] w-full bg-white rounded-2xl py-8 px-4 text-mine-shaft max-h-dvh overflow-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Claim winnings</DialogTitle>
        </DialogHeader>
        <>
          <h3 className="mb-2 text-base text-center">
            Round #{activeClaimData.roundId}
          </h3>

          <div className="flex flex-col">
            <p className="mb-1 text-center md:text-left">You won</p>

            <div className="flex flex-col items-start justify-start md:flex-row md:items-center md:justify-between">
              <div className="text-center md:text-left leading-tight font-bold text-[44px]">
                {rewardAsBalance} <span className="ml-1">HBAR!</span>
              </div>
            </div>

            <div className="mt-3 md:mt-0 text-center md:text-left text-xs">
              ~{currencyFormatter(dollarRewardAsBalance, 3)}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <PrimaryButton
              text={`${pendingTx ? "Claiming..." : "Claim"} ${
                pendingBatchClaims > 1 ? `(${pendingBatchClaims})` : ""
              }`}
              disabled={pendingTx}
              onClick={() =>
                shouldBatchRequest ? handleBatchClaim() : handleClaim()
              }
              className="mt-5 w-full text-white font-medium hover:opacity-90 disabled:opacity-60"
            />
          </div>
        </>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimWinnings;
