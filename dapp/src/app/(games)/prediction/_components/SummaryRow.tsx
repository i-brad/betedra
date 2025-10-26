import { formatHBAR } from "@/helpers";
import { cn } from "@/utils";
import BigNumber from "bignumber.js";

type SummaryType = "won" | "lost" | "entered";

interface SummaryRowProps {
  type: SummaryType;
  summary: any;
  tokenPrice: BigNumber;
}

const summaryTypeColors = {
  won: "success",
  lost: "failure",
  entered: "text",
};

const summaryTypeSigns = {
  won: "+",
  lost: "-",
  entered: "",
};

const SummaryRow: React.FC<React.PropsWithChildren<SummaryRowProps>> = ({
  type,
  summary,
  tokenPrice,
}) => {
  const color = summaryTypeColors[type];
  const { rounds, amount } = summary[type];
  const totalRounds = summary.entered.rounds;
  const roundsInPercents = ((rounds * 100) / totalRounds).toFixed(2);
  const typeTranslationKey = type.charAt(0).toUpperCase() + type.slice(1);
  const displayAmount = type === "won" ? summary[type].payout : amount;
  const amountInUsd = tokenPrice.multipliedBy(displayAmount).toNumber();
  const roundsInPercentsDisplay = !Number.isNaN(parseFloat(roundsInPercents))
    ? `${roundsInPercents}%`
    : "0%";

  return (
    <div>
      <h3 className="text-sm lg:text-base text-blue-gray-500">
        {typeTranslationKey}
      </h3>
      <div className="flex justify-between items-center">
        <div>
          <span
            className={cn("block text-base text-blue-gray-400 font-medium", {
              "text-success-500": color === summaryTypeColors.won,
              "text-error-400": color === summaryTypeColors.lost,
            })}
          >
            {rounds} {rounds > 1 ? "Rounds" : "Round"}
          </span>
          <span className="text-xs text-blue-gray-500">
            {type === "entered" ? "Total" : roundsInPercentsDisplay}
          </span>
        </div>
        <div className="text-right">
          <span
            className={cn("block text-base text-blue-gray-400 font-medium", {
              "text-success-500": color === summaryTypeColors.won,
              "text-error-400": color === summaryTypeColors.lost,
            })}
          >
            {`${summaryTypeSigns[type]}${formatHBAR(displayAmount, 3)} HBAR`}
          </span>
          <span className="text-xs text-blue-gray-500">
            {`~$${amountInUsd.toFixed(2)}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SummaryRow;
