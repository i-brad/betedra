import TimeIcon from "@/components/custom_icons/TimeIcon";
import VideoIcon from "@/components/custom_icons/VideoIcon";
import PrimaryButton from "@/components/shared/Buttons";
import Pagination from "@/components/shared/Pagination";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFilteredBets, getPriceDifference } from "@/helpers";
import { getNetPayout, getRoundResult, Result } from "@/helpers/rounds";
import useGetHistory from "@/hooks/useGetHistory";
import useIsClaimable from "@/hooks/useIsClaimable";
import useIsRefundable from "@/hooks/useIsRefundable";
import PredictionsABI from "@/smart-contract/abi/prediction";
import { REWARD_RATE } from "@/state/predictions/config";
import { Bet, BetPosition, HistoryFilter } from "@/state/types";
import { cn, formatBigIntToFixed, formatPriceDifference } from "@/utils";
import { orderBy } from "lodash";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AiOutlineClockCircle } from "react-icons/ai";
import { FaArrowDownLong } from "react-icons/fa6";
import { toast } from "sonner";
import { useAccount, useWriteContract } from "wagmi";
import ClaimWinning from "./ClaimWinning";
import PNLHistoryTab from "./PNLHistoryTab";
import Share from "./Share";

interface StartingSoonProps {
  epoch: number;
  isLiveRound: boolean;
  isOpenRound: boolean;
}

const StartingSoon = ({
  epoch,
  isLiveRound,
  isOpenRound,
}: StartingSoonProps) => {
  return (
    <div className="flex items-center justify-between mb-2 px-4 py-3 rounded-sm">
      <span className="text-xs text-blue-gray-500">
        Round <span className="font-medium text-blue-gray-900">#{epoch}</span>
      </span>
      <span className="flex space-x-[0.3125rem] items-center text-xs leading-4 text-blue-gray-900 bg-blue-gray-200 rounded-full px-2 py-0.5">
        {isLiveRound ? (
          <VideoIcon />
        ) : (
          <span className="block size-[0.375rem] rounded-full bg-purple-500" />
        )}
        <span>
          {isLiveRound ? <span></span> : isOpenRound ? "Starting soon" : ""}
        </span>
      </span>
    </div>
  );
};

const address = process.env.NEXT_PUBLIC_PREDICTION_ADDRESS as `0x${string}`;

const Round = ({ bet, currentEpoch }: { bet: Bet; currentEpoch: number }) => {
  const { amount, round, claimed, position } = bet;
  // console.log({ epoch: round?.epoch, position, round, currentEpoch });
  const roundResult = getRoundResult(bet, currentEpoch);
  const isOpenRound = round?.epoch === currentEpoch;
  const isLiveRound = round?.epoch === currentEpoch - 1;

  const isClaimable = useIsClaimable(round?.epoch as number);
  const { isRefundable, setIsRefundable } = useIsRefundable(
    round?.epoch as number
  );

  const { address: account } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();

  // Winners get the payout, otherwise the claim what they put it if it was canceled
  const payout =
    roundResult === Result.WIN ? getNetPayout(bet, REWARD_RATE) : 0;

  const multiplier = useMemo(() => {
    if (position && amount && round) {
      if (position === BetPosition.BEAR) {
        return round?.bearAmount / amount;
      }

      if (position === BetPosition.BULL) {
        return round?.bullAmount / amount;
      }
    }
    return 1;
  }, [amount, round, position]);

  if (isOpenRound || isLiveRound) {
    return (
      <StartingSoon
        epoch={round?.epoch}
        isLiveRound={isLiveRound}
        isOpenRound={isOpenRound}
      />
    );
  }

  const profit = amount + payout;

  const priceDifference = getPriceDifference(
    round?.closePrice ?? 0n,
    round?.lockPrice ?? 0n
  );

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
    <AccordionItem
      value={`item-${round?.epoch}`}
      className="border w-full border-blue-gray-200 rounded-sm px-4 py-3"
    >
      <AccordionTrigger className="py-0 w-full font-normal hover:no-underline">
        <span className="text-xs text-blue-gray-500">
          Round{" "}
          <span className="font-medium text-blue-gray-900">
            #{round?.epoch}
          </span>
        </span>
        <span
          className={cn(
            "flex items-center text-sm text-success-400 space-x-1.25",
            {
              "text-red-400": roundResult !== Result.WIN,
            }
          )}
        >
          {round?.position === BetPosition.HOUSE ? (
            <span>-{amount?.toFixed(2)} HBAR</span>
          ) : (
            <span>
              {roundResult === Result.WIN ? "+" : "-"}
              {profit.toFixed(3)} HBAR
            </span>
          )}
          <span
            className={cn(
              "py-0.5 px-1.5 flex items-center space-x-0.5 success-300 text-xs font-medium rounded-sm bg-alice-blue/[7%]"
            )}
          >
            {round?.position === BetPosition.HOUSE ? null : (
              <FaArrowDownLong
                size={12}
                className={cn({
                  "rotate-180": round?.position === BetPosition.BULL,
                })}
              />
            )}
            <span>
              {round?.position === BetPosition.BULL
                ? "UP"
                : round?.position === BetPosition.BEAR
                ? "DOWN"
                : "HOUSE"}
            </span>
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="pb-0 pt-2">
        {round &&
        (isClaimable || claimed) &&
        !isRefundable &&
        position !== BetPosition.HOUSE ? (
          <div className="flex items-center justify-between w-full gap-2 px-3 mt-2 mb-4">
            <Share round={round as any} multiplier={multiplier.toString()} />
            <ClaimWinning
              round={round as any}
              disabled={claimed}
              betAmount={profit}
            />
          </div>
        ) : round && isRefundable ? (
          <PrimaryButton
            disabled={isPending}
            text={isPending ? "Reclaiming..." : "Reclaim position"}
            onClick={reclaimHandler}
            className="mb-3 !text-sm"
          />
        ) : null}
        <div className="bg-blue-gray-50 rounded-md p-2 mb-2 space-y-1">
          {round?.startAt ? (
            <span className="flex items-center justify-between">
              <span className="text-blue-gray-500 text-xs">Date</span>
              <span className="text-right text-xs text-blue-gray-900">
                {round?.startAt
                  ? new Date(round?.startAt * 1000).toLocaleDateString()
                  : null}
              </span>
            </span>
          ) : null}
          <span className="flex items-center justify-between">
            <span className="text-blue-gray-500 text-xs">Verdict</span>
            <span className="text-right text-xs capitalize text-blue-gray-900">
              {roundResult === Result.HOUSE
                ? `${roundResult} Win (You Lose)`
                : roundResult}
            </span>
          </span>
          <span className="flex items-center justify-between">
            <span className="text-blue-gray-500 text-xs">Your bet</span>
            <span className="text-right text-xs text-blue-gray-900">
              {amount?.toFixed(2)}
            </span>
          </span>
          <span className="flex items-center justify-between">
            <span className="text-blue-gray-500 text-xs">Your position</span>
            <span className="text-right text-xs text-blue-gray-900">
              {position === BetPosition?.BULL ? "UP" : "DOWN"}
            </span>
          </span>
          <div className="flex items-start justify-between">
            <span className="text-white font-medium text-xs">Your result</span>
            <span className="block text-right">
              <span
                className={cn("text-sm text-error-400 block", {
                  "text-success-300": roundResult === Result.WIN,
                })}
              >
                {profit?.toFixed(3)} HBAR
              </span>
              {/* <span className="text-blue-gray-900 text-xs">-$0.12</span> */}
            </span>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-blue-gray-900 mb-1">
            Round History
          </h4>
          <div className="bg-blue-gray-50 rounded-lg p-4">
            <h6 className="text-xs text-blue-gray-500 mb-0.5">Closed Price</h6>
            <span className="flex items-center mb-[0.4375rem] justify-between">
              <span className="text-lg lg:text-2xl font-medium text-blue-gray-900">
                {round?.closePrice
                  ? formatBigIntToFixed(round?.closePrice?.toString(), 4)
                  : 0}
              </span>
              {Number(priceDifference) !== 0 ? (
                <span
                  className={cn(
                    "flex text-error-400 items-center space-x-0.5",
                    {
                      "text-success-300": round?.position === BetPosition.BULL,
                    }
                  )}
                >
                  <FaArrowDownLong
                    size={14}
                    className={cn({
                      "rotate-180": round?.position === BetPosition.BULL,
                    })}
                  />
                  <span className="text-sm">
                    {priceDifference
                      ? formatPriceDifference(priceDifference?.toString(), 4)
                      : 0}
                  </span>
                </span>
              ) : null}
            </span>
            <div className="space-y-1">
              <span className="flex items-center justify-between">
                <span className="text-blue-gray-500 text-xs">Locked Price</span>
                <span className="text-right text-xs text-blue-gray-900">
                  {round?.lockPrice
                    ? formatBigIntToFixed(round?.lockPrice?.toString(), 4)
                    : 0}
                </span>
              </span>
              <span className="flex items-center justify-between">
                <span className="text-blue-gray-500 text-xs">Price Pool</span>
                <span className="text-right text-sm font-medium text-blue-gray-900">
                  {round?.totalAmount
                    ? Number(round?.totalAmount)?.toFixed(3)
                    : 0}{" "}
                  HBAR
                </span>
              </span>
              <span className="flex items-center justify-between">
                <span className="text-blue-gray-500 text-xs">UP</span>
                <span className="text-right text-xs font-medium text-blue-gray-900">
                  {round?.bullAmount} HBAR
                </span>
              </span>
              <span className="flex items-center justify-between">
                <span className="text-blue-gray-500 text-xs">DOWN</span>
                <span className="text-right text-xs font-medium text-blue-gray-900">
                  {round?.bearAmount} HBAR
                </span>
              </span>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

const Rounds = ({ bets, currentEpoch }: TabsProps) => {
  return (
    <>
      <Accordion type="single" collapsible className="w-full space-y-2">
        {orderBy(bets, ["round.epoch"], ["desc"])?.map((bet) => (
          <Round
            key={bet?.round?.epoch}
            bet={bet}
            currentEpoch={currentEpoch}
          />
        ))}
      </Accordion>
    </>
  );
};

interface TabsProps {
  bets: Bet[];
  currentEpoch: number;
  maxPages?: number;
}

const RoundsTabs = ({ currentEpoch, maxPages, bets }: TabsProps) => {
  const [activeTab, setActiveTab] = useState<HistoryFilter>(HistoryFilter.ALL);
  const results = getFilteredBets(bets as any, activeTab);
  const hasBetHistory = results && results.length > 0;
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { isConnected } = useAccount();

  const backToStartHandler = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("page");
    return `${pathname}?${params.toString()}`;
  };

  return (
    <>
      <Tabs
        onValueChange={(value) => setActiveTab(value as HistoryFilter)}
        defaultValue="all"
        className="w-full"
      >
        <TabsList className="w-fit rounded-none bg-transparent p-0 mb-2">
          {[
            HistoryFilter.ALL,
            HistoryFilter.COLLECTED,
            HistoryFilter.UNCOLLECTED,
          ].map((tab, index) => (
            <TabsTrigger
              value={tab}
              key={index}
              className="capitalize data-[state=active]:text-blue-800 data-[state=active]:bg-blue-50 px-2 py-1 data-[state=active]:rounded-lg"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="all">
          {hasBetHistory && isConnected ? (
            <Rounds currentEpoch={currentEpoch} bets={results} />
          ) : (
            <div className="min-h-16 py-8 text-sm text-center text-blue-gray-500 flex flex-col space-y-2 items-center">
              <AiOutlineClockCircle size={64} />
              <p>No history yet</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="collected">
          {hasBetHistory && isConnected ? (
            <Rounds currentEpoch={currentEpoch} bets={results} />
          ) : (
            <div className="min-h-16 py-8 text-sm text-center text-blue-gray-500 flex flex-col space-y-2 items-center">
              <AiOutlineClockCircle size={64} />
              <p>No history yet</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="uncollected">
          {hasBetHistory && isConnected ? (
            <Rounds currentEpoch={currentEpoch} bets={results} />
          ) : (
            <div className="min-h-16 py-8 text-sm text-center text-blue-gray-500 flex flex-col space-y-2 items-center">
              <AiOutlineClockCircle size={64} />
              <p>No history yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      {hasBetHistory && isConnected ? (
        <div className="max-w-full overflow-auto flex-col space-y-2 flex items-center justify-center mt-6">
          <Pagination totalPages={maxPages ?? 0} hideLabel />
          {maxPages !== 1 ? (
            <button
              className="text-sm text-center text-accent underline"
              onClick={backToStartHandler}
            >
              Back to start
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
};

const PNL = ({ bets, currentEpoch }: TabsProps) => {
  const results = getFilteredBets(bets as any, HistoryFilter.ALL);
  const hasBetHistory = results && results.length > 0;
  const { isConnected } = useAccount();

  if (!hasBetHistory || !isConnected) {
    return (
      <div className="min-h-28 py-8 text-sm text-center text-blue-gray-500 flex flex-col space-y-2 items-center">
        <AiOutlineClockCircle size={64} />
        <p>No history yet</p>
      </div>
    );
  }

  return <PNLHistoryTab bets={bets} currentEpoch={currentEpoch} />;
};

const History = ({ currentEpoch }: { currentEpoch: number }) => {
  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const { bets, maxPages } = useGetHistory(Number(page || 1));

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          title="History"
          className="!bg-transparent !h-auto flex items-center !font-normal hover:border-blue-500 border text-center border-gray-200 !px-4 !py-2.5 rounded-sm gap-3 !text-base text-blue-gray-900"
        >
          <TimeIcon />
          <span>History</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[24rem] overflow-auto max-h-full bg-white rounded-2xl py-8 px-6 text-mine-shaft">
        <DialogHeader className="mb-1">
          <DialogTitle className="text-lg text-center font-semibold">
            History
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="rounds" className="w-full">
          <TabsList className="w-full border-b border-blue-gray-50 justify-start bg-transparent p-0 mb-2">
            <TabsTrigger
              value="rounds"
              className="px-4 py-[0.53125rem] text-blue-gray-400 data-[state=active]:text-blue-gray-900 border-b-2 border-transparent data-[state=active]:border-blue-500"
            >
              Rounds
            </TabsTrigger>
            <TabsTrigger
              value="pnl"
              className="px-4 py-[0.53125rem] text-blue-gray-400 data-[state=active]:text-blue-gray-900 border-b-2 border-transparent data-[state=active]:border-blue-500"
            >
              PNL
            </TabsTrigger>
          </TabsList>
          <TabsContent value="rounds">
            <RoundsTabs
              bets={bets}
              maxPages={maxPages}
              currentEpoch={currentEpoch}
            />
          </TabsContent>
          <TabsContent value="pnl">
            <PNL bets={bets} currentEpoch={currentEpoch} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default History;
