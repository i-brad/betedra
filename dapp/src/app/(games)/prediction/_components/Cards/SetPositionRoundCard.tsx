import { updateLeaderboard } from "@/app/actions/leaderboard";
import PrimaryButton from "@/components/shared/Buttons";
import { ConnectWallet } from "@/components/shared/ConnectWallet";
import CustomInput from "@/components/shared/CustomInput";
import useGetBalance from "@/hooks/useGetBalanceAndDecimal";
import PredictionsABI from "@/smart-contract/abi/prediction";
import { BetPosition } from "@/state/types";
import { cn } from "@/utils";
import { parseEther, ZeroAddress } from "ethers";
import React, { useState } from "react";
import { FaArrowDownLong } from "react-icons/fa6";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { toast } from "sonner";
import { useAccount, useWriteContract } from "wagmi";
import TransactionModal from "../TransactionModal";

interface SetPositionCardProps {
  position: BetPosition;
  togglePosition: () => void;
  epoch: number;
  onBack: () => void;
  onSuccess: () => Promise<void>;
}

const address = process.env.NEXT_PUBLIC_PREDICTION_ADDRESS as `0x${string}`;

const SetPositionRoundCard = ({
  position,
  togglePosition,
  onBack,
  epoch,
  onSuccess,
}: SetPositionCardProps) => {
  const { isConnected, address: account } = useAccount();
  const [isSuccess, setSuccessState] = useState(false);
  const [amount, setAmount] = useState("");
  const { balance } = useGetBalance(ZeroAddress, 18);
  const { isPending, writeContractAsync } = useWriteContract();

  const confirmHandler = async () => {
    if (!amount) {
      toast.error("Please enter an amount", {
        className: "toast-error",
      });
      return;
    }

    if (!account) {
      toast.error("Please connect a wallet", {
        className: "toast-error",
      });
      return;
    }

    const betMethod = position === BetPosition.BULL ? "betBull" : "betBear";

    const callOptions = { value: parseEther(amount) };

    const args: any = [epoch];
    try {
      const response = await writeContractAsync({
        abi: PredictionsABI,
        address,
        account,
        functionName: betMethod,
        args,
        ...callOptions,
      });

      if (typeof response === "string") {
        setSuccessState(true);

        toast.success(
          `${
            position === BetPosition.BULL ? "UP" : "DOWN"
          } position entered successfully`,
          {
            className: "toast-success",
          }
        );

        onSuccess();
        await updateLeaderboard({ address: account, totalRoundsPlayed: 1 });
      }
    } catch (error: any) {
      toast.error(
        error?.shortMessage || error?.message || "Failed to make a bet",
        {
          className: "toast-error",
        }
      );
    }
  };

  const minimumAmount = 5;
  return (
    <>
      <div
        className={cn(
          "w-full relative z-30 rounded-[0.625rem] border border-blue-gray-200 bg-blue-gray-100 px-5 pt-3 pb-4"
        )}
      >
        <div className="w-full">
          <span className="flex items-center mb-2 justify-between">
            <button
              onClick={onBack}
              className="flex items-center text-sm space-x-1.25 text-blue-gray-900"
            >
              <MdKeyboardArrowLeft size={14} />
              <span>Enter your position</span>
            </button>
            <button
              onClick={togglePosition}
              className={cn(
                "py-0.5 px-1.5 flex items-center space-x-0.5 bg-success-100 text-xs text-success-500",
                {
                  "bg-error-100 text-error-400": position === BetPosition.BEAR,
                }
              )}
            >
              <FaArrowDownLong
                size={12}
                className={cn("text-error-400", {
                  "rotate-180 text-success-500": position === BetPosition.BULL,
                })}
              />
              <span>{position === BetPosition.BULL ? "UP" : "DOWN"}</span>
            </button>
          </span>
          <span className="bg-blue-gray-200 block rounded-[1.5rem] w-full h-[0.3125rem] mb-4" />
          <div className="bg-white rounded-lg p-4">
            <div className="mb-[1.125rem]">
              <CustomInput
                label="Enter amount"
                name="amount"
                value={amount}
                balance={balance}
                minimumAmount={minimumAmount}
                handleInputChange={(value) => setAmount(value)}
              />
              <p className="text-[0.625rem] text-gray-50 mt-[0.1875rem]">
                Minimum amount: {minimumAmount} HBAR
              </p>
            </div>
            {isConnected ? (
              <PrimaryButton
                onClick={confirmHandler}
                disabled={
                  isPending ||
                  !amount ||
                  Number(amount) > Number(balance) ||
                  Number(amount) < minimumAmount
                }
                text={
                  Number(amount) > Number(balance)
                    ? "Insufficient balance"
                    : isPending
                    ? "Betting..."
                    : "Confirm"
                }
                className="w-full text-sm mb-[1.125rem]"
              />
            ) : (
              <ConnectWallet>
                <PrimaryButton
                  text="Connect wallet"
                  as="span"
                  className="w-full text-sm mb-[1.125rem]"
                />
              </ConnectWallet>
            )}
            <p className="text-[0.625rem] rounded-lg text-blue-gray-900 bg-yellow-50 p-2">
              Once you enter your position, you cannot change or remove it.
            </p>
          </div>
        </div>
      </div>
      <TransactionModal
        position={position === BetPosition.BULL ? "UP" : "DOWN"}
        open={isSuccess}
        betAmount={amount}
        setOpenState={setSuccessState}
        onClose={() => {
          if (isSuccess) {
            setAmount("");
            onBack();
          }
        }}
      />
    </>
  );
};

export default SetPositionRoundCard;
