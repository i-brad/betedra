import ShareIcon from "@/components/custom_icons/ShareIcon";
import PrimaryButton from "@/components/shared/Buttons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NodeRound } from "@/state/types";
import { cn, formatBigIntToFixed } from "@/utils";
import download from "downloadjs";
import * as htmlToImage from "html-to-image";
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";

interface ShareComponentProps {
  round: NodeRound;
  position?: string;
  multiplier: string;
  className?: string;
}

const ReusedComponent = ({
  round,
  position,
  multiplier,
}: ShareComponentProps) => {
  const { closePrice, lockPrice, epoch } = round;

  return (
    <div>
      <div className="border border-blue-gray-200 flex justify-between rounded-sm py-3 px-4 mb-2">
        <div className="w-full ">
          <span className="flex items-center mb-2 space-x-1">
            <Image src="/svgs/hbar.svg" alt="HBAR" width={26} height={26} />
            <span className="inline-block font-medium text-base">
              HBAR/USDC
            </span>
          </span>
          <span className="block text-xs text-success-400 mb-2">
            {position} Position Entered
          </span>
          <div className="space-y-1 mb-5">
            <span className="flex text-xs items-center justify-between">
              <span className="text-gray-50">Entry Price</span>
              <span className="text-gray-25">
                {lockPrice ? formatBigIntToFixed(lockPrice?.toString(), 4) : 0}
              </span>
            </span>
            <span className="flex text-xs items-center justify-between">
              <span className="text-gray-50">Closed Price</span>
              <span className="text-gray-25">
                {" "}
                {closePrice
                  ? formatBigIntToFixed(closePrice?.toString(), 4)
                  : 0}
              </span>
            </span>
            <span className="flex text-xs items-center justify-between">
              <span className="text-gray-50">Round</span>
              <span className="text-gray-25">#{epoch}</span>
            </span>
          </div>
          <span className="text-[0.625rem]">
            <span className="block text-gray-50">Share at:</span>
            <span className="block text-gray-25">
              {new Date().toLocaleString()}
            </span>
          </span>
        </div>
        <div className="flex w-full flex-col justify-between">
          <span className="font-medium text-success-400 text-2xl text-right">
            {Number(multiplier).toFixed(2)}x payout
          </span>
          <span className="flex flex-col items-end">
            <Image
              src="/svgs/logo.svg"
              alt="Betedra Logo"
              width={111}
              priority
              height={28}
            />
            <span className="block text-xs">Prediction</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export function Share({
  round,
  position,
  multiplier,
  className,
}: ShareComponentProps) {
  const { address } = useAccount();
  const [downloading, setDownloadingState] = useState(false);

  const copyHandler = () => {
    const origin = window.location.origin;
    const value = `${origin}/wins/${address}/${round?.epoch}`;
    navigator.clipboard.writeText(value);
    toast("Link copied.", {
      className: "toast-success",
    });
  };

  const downloadHandler = () => {
    setDownloadingState(true);
    const node = document.getElementById("win");

    if (node) {
      node.style.display = "block";
      htmlToImage
        .toPng(node)
        .then((dataUrl) =>
          download(dataUrl, `betedra-prediction-win-${round?.epoch}.png`)
        )
        .catch((error) => {
          toast.error("oops, something went wrong!", {
            className: "toast-error",
            description: error?.shortMessage || error?.message,
          });
        })
        .finally(() => {
          node.style.display = "none";
          setDownloadingState(false);
        });
    }
  };
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <button
            className={cn(
              "bg-transparent border border-[#B3B3B3] rounded-md px-3 py-[0.625rem]",
              className
            )}
          >
            <ShareIcon />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-[24.5rem] bg-white border border-onyx rounded-[0.625rem] drop-shadow-container backdrop-blur-sm py-2 px-4 pb-6 text-blue-gray-900">
          <DialogHeader className="mb-[0.625rem]">
            <DialogTitle className="text-base lg:text-lg font-medium text-blue-gray-900">
              Share your wins
            </DialogTitle>
          </DialogHeader>
          <div>
            <div className="mb-8">
              <ReusedComponent
                round={round}
                multiplier={multiplier}
                position={position}
              />
            </div>
            <span className="flex items-center space-x-2">
              <PrimaryButton
                onClick={copyHandler}
                text="Copy link"
                className="bg-accent/[12%] text-sm"
              />
              <PrimaryButton
                text={downloading ? "Downloading..." : "Download"}
                className="text-sm"
                onClick={downloadHandler}
                disabled={downloading}
              />
            </span>
          </div>
        </DialogContent>
      </Dialog>
      <div
        id="win"
        className="w-full min-w-[24.5rem] hidden bg-white border border-onyx drop-shadow-container backdrop-blur-sm py-2 px-4 pb-6 text-blue-gray-900"
      >
        <h2 className="text-base lg:text-lg font-medium mb-[0.625rem] text-blue-gray-900">
          Betedra Win - #{round?.epoch}
        </h2>
        <ReusedComponent
          round={round}
          multiplier={multiplier}
          position={position}
        />
      </div>
    </>
  );
}

export default Share;
