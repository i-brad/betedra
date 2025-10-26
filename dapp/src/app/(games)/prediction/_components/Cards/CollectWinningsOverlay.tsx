import { NodeLedger, NodeRound } from "@/state/types";
import { formatUnits } from "ethers";
import ClaimWinning from "../ClaimWinning";
import Share from "../Share";
import Image from "next/image";

interface Props {
  disabled?: boolean;
  round: NodeRound;
  betAmount?: NodeLedger["amount"];
  multiplier: string;
  position: string;
}

const CollectWinningsOverlay = ({
  round,
  multiplier,
  betAmount,
  disabled,
  position,
}: Props) => {
  return (
    <>
      <div className="absolute z-50 bottom-0 left-0 backdrop-blur-[0.6875rem] bg-white rounded-b-[0.625rem] pl-[0.875rem] pr-1 py-[1.375rem] w-full flex items-center justify-between space-x-3">
        <Image src="/svgs/trophy.svg" alt="Trophy" width={33.9} height={32} />
        <ClaimWinning
          disabled={disabled}
          round={round}
          betAmount={Number(
            (
              Number(formatUnits(betAmount?.toString() ?? "0", 8)) *
              (Number(multiplier) || 1)
            ).toFixed(3)
          )}
        />
        <Share round={round} multiplier={multiplier} position={position} />
      </div>
    </>
  );
};

export default CollectWinningsOverlay;
