"use client";

import CheckIcon from "@/components/custom_icons/CheckIcon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import React from "react";

interface Props {
  open: boolean;
  setOpenState: React.Dispatch<React.SetStateAction<boolean>>;
  position: string;
  betAmount: string;
  onClose?: () => void;
}

const TransactionModal = ({
  betAmount,
  position,
  open,
  setOpenState,
  onClose,
}: Props) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpenState(value);
        if (value === false) onClose?.();
      }}
    >
      <DialogContent className="max-w-[23rem] bg-white border border-onyx rounded-[0.625rem] drop-shadow-container backdrop-blur-sm py-8 px-6 text-blue-gray-900">
        <DialogHeader>
          <DialogTitle className="sr-only">Transaction</DialogTitle>
        </DialogHeader>
        <div className="text-blue-gray-900">
          <span className="flex items-center mb-4 flex-col text-center space-y-1">
            <CheckIcon />
            <h3 className="text-lg font-medium">Transaction Successful</h3>
          </span>
          <span className="block border text-xs border-blue-gray-200 px-4 py-[0.4375rem] rounded-sm">
            <h6 className="mb-1">{position} Position entered</h6>
            <span className="text-blue-gray-800">Bet Amount: {betAmount}</span>
          </span>
          <div className="bg-secondary-700 mt-4 text-blue-gray-900 text-xs lg:text-sm px-4 rounded py-[0.4375rem] flex items-start space-x-1">
            <span className="inline-block text-base">🎉</span>
            <p>
              You&apos;ve earned score by placing a bet. View{" "}
              <Link href="/prediction/leaderboard" className="underline">
                leaderboard
              </Link>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;
