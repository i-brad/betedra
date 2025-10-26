"use client";
import { addLotteryRound } from "@/app/actions/lottery";
import TicketIcon from "@/components/custom_icons/TicketIcon";
import PrimaryButton from "@/components/shared/Buttons";
import { ConnectWallet } from "@/components/shared/ConnectWallet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useGetBalance from "@/hooks/useGetBalanceAndDecimal";
import useHBarPrice from "@/hooks/useHBarPrice";
import useLottery from "@/hooks/useLottery";
import LotteryABI from "@/smart-contract/abi/lottery";
import { CONTRACT_ADDRESS } from "@/state/lottery/constants";
import { LotteryStatus } from "@/state/lottery/types";
import useLotteryTransitionStore from "@/store/useLotteryTransitionStore";
import { TicketProps, useTicketsStore } from "@/store/useTicketStore";
import { currencyFormatter } from "@/utils";
import { getFullDisplayBalance } from "@/utils/formatBalance";
import BigNumber from "bignumber.js";
import { parseUnits, ZeroAddress } from "ethers";
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { toast } from "sonner";
import { useAccount, useWriteContract } from "wagmi";
import Ticket from "./Ticket";

interface RandomizeTicketsProps {
  totalCost: string;
  randomize: () => void;
  tickets: TicketProps[];
  allComplete: boolean;
  goBack: () => void;
  confirmHandler: () => void;
  isConfirming: boolean;
}

const RandomizeTickets = ({
  totalCost,
  tickets,
  randomize,
  goBack,
  isConfirming,
  confirmHandler,
}: RandomizeTicketsProps) => {
  return (
    <div className="space-y-[1.125rem]">
      <span className="flex items-center space-x-2.5">
        <MdKeyboardArrowLeft size={20} role="button" onClick={goBack} />
        <h3 className="w-full text-base font-semibold text-center">
          Randomize your numbers
        </h3>
      </span>
      {tickets.map((ticket, index) => (
        <Ticket
          key={ticket.id}
          ticket={ticket}
          showTotal={index == 0}
          cost={Number(totalCost)?.toFixed(2)}
          duplicateWith={ticket.duplicateWith}
        />
      ))}
      {/* <Ticket index={1} cost={5} showTotal />
      <Ticket index={2} /> */}
      <PrimaryButton
        text="Randomize your numbers"
        className="py-2 bg-white white"
        onClick={randomize}
        disabled={isConfirming}
      />
      <span className="block p-2 text-xs rounded-lg bg-yellow-50 text-blue-gray-900">
        Your numbers are chosen randomly, ensuring there are no duplicates. Just
        tap on a number if you&apos;d like to make any changes or click on the
        button.
      </span>
      <PrimaryButton
        text="Confirm and buy"
        className="py-2"
        disabled={isConfirming}
        onClick={confirmHandler}
        disabledText={isConfirming ? "Confirming..." : ""}
      />
    </div>
  );
};

interface Props {
  trigger: ReactNode;
}

enum BuyingStage {
  BUY = "Buy",
  EDIT = "Edit",
}

const BuyTickets = ({ trigger }: Props) => {
  const [isOpen, setOpen] = useState(false);
  const { isPending, writeContractAsync } = useWriteContract();
  const { isConnected, address: account } = useAccount();
  const {
    currentRound,
    maxNumberTicketsPerBuyOrClaim,
    currentLotteryId,
    userTickets,
    refetch,
  } = useLottery();
  const { isTransitioning } = useLotteryTransitionStore();
  const hbarPrice = useHBarPrice();
  const ticketBuyIsDisabled =
    currentRound?.status !== LotteryStatus.OPEN || isTransitioning;
  const [ticketsToBuy, setTicketsToBuy] = useState("");
  const { balance } = useGetBalance(ZeroAddress, 18);
  const userHbar = useMemo(() => new BigNumber(balance || 0), [balance]);
  const priceTicketInHbar = useMemo(
    () => new BigNumber(currentRound?.priceTicketInWHbar || 0),
    [currentRound]
  );
  const discountDivisor = useMemo(
    () => new BigNumber(currentRound?.discountDivisor || 0),
    [currentRound]
  );

  const [discountValue, setDiscountValue] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [ticketCostBeforeDiscount, setTicketCostBeforeDiscount] = useState("");
  const [buyingStage, setBuyingStage] = useState<BuyingStage>(BuyingStage.BUY);
  const [maxTicketPurchaseExceeded, setMaxTicketPurchaseExceeded] =
    useState(false);
  const [userNotEnoughHbar, setUserNotEnoughHbar] = useState(false);

  const { randomize, tickets, allComplete, getTicketsForPurchase, reset } =
    useTicketsStore();

  const limitNumberByMaxTicketsPerBuy = useCallback(
    (number: BigNumber) => {
      return number.gt(maxNumberTicketsPerBuyOrClaim)
        ? maxNumberTicketsPerBuyOrClaim
        : number;
    },
    [maxNumberTicketsPerBuyOrClaim]
  );

  const getTicketCostAfterDiscount = useCallback(
    (numberTickets: BigNumber) => {
      const totalAfterDiscount = priceTicketInHbar
        .times(numberTickets)
        .times(discountDivisor.plus(1).minus(numberTickets))
        .div(discountDivisor);
      return totalAfterDiscount;
    },
    [discountDivisor, priceTicketInHbar]
  );

  const validateInput = useCallback(
    (inputNumber: BigNumber) => {
      const limitedNumberTickets = limitNumberByMaxTicketsPerBuy(inputNumber);
      const hbarCostAfterDiscount =
        getTicketCostAfterDiscount(limitedNumberTickets);

      if (hbarCostAfterDiscount.gt(userHbar)) {
        setUserNotEnoughHbar(true);
      } else if (limitedNumberTickets.eq(maxNumberTicketsPerBuyOrClaim)) {
        setMaxTicketPurchaseExceeded(true);
      } else {
        setUserNotEnoughHbar(false);
        setMaxTicketPurchaseExceeded(false);
      }
    },
    [
      limitNumberByMaxTicketsPerBuy,
      getTicketCostAfterDiscount,
      maxNumberTicketsPerBuyOrClaim,
      userHbar,
    ]
  );

  const handleInputChange = (input: string) => {
    // Force input to integer
    const inputAsInt = parseInt(input, 10);
    const inputAsBN = new BigNumber(inputAsInt);
    const limitedNumberTickets = limitNumberByMaxTicketsPerBuy(inputAsBN);
    validateInput(inputAsBN);
    setTicketsToBuy(inputAsInt ? limitedNumberTickets.toString() : "");
    reset(parseInt(limitedNumberTickets?.toString(), 10), userTickets);
  };

  useEffect(() => {
    const numberOfTicketsToBuy = new BigNumber(ticketsToBuy);
    const costAfterDiscount = getTicketCostAfterDiscount(numberOfTicketsToBuy);
    const costBeforeDiscount = priceTicketInHbar.times(numberOfTicketsToBuy);
    const discountBeingApplied = costBeforeDiscount.minus(costAfterDiscount);
    setTicketCostBeforeDiscount(
      costBeforeDiscount.gt(0)
        ? getFullDisplayBalance(costBeforeDiscount, 0)
        : "0"
    );
    setTotalCost(
      costAfterDiscount.gt(0)
        ? getFullDisplayBalance(costAfterDiscount, 0, 2)
        : "0"
    );
    setDiscountValue(
      discountBeingApplied.gt(0)
        ? getFullDisplayBalance(discountBeingApplied, 0, 5)
        : "0"
    );
  }, [
    ticketsToBuy,
    priceTicketInHbar,
    discountDivisor,
    getTicketCostAfterDiscount,
  ]);

  const percentageDiscount = useMemo(() => {
    if (!discountValue || !ticketCostBeforeDiscount) return 0;
    const percentageAsBn = new BigNumber(discountValue)
      .div(new BigNumber(ticketCostBeforeDiscount))
      .times(100);
    if (percentageAsBn.isNaN() || percentageAsBn.eq(0)) {
      return 0;
    }
    return percentageAsBn.toNumber().toFixed(2);
  }, [discountValue, ticketCostBeforeDiscount]);

  const disableBuying = useMemo(
    () =>
      isPending ||
      userNotEnoughHbar ||
      !ticketsToBuy ||
      new BigNumber(ticketsToBuy).lte(0) ||
      getTicketsForPurchase().length !== parseInt(ticketsToBuy, 10),
    [isPending, userNotEnoughHbar, ticketsToBuy, getTicketsForPurchase]
  );

  const errorMessage = useMemo(() => {
    if (userNotEnoughHbar) return "Insufficient HBAR balance";
    return `The maximum number of tickets you can buy in one transaction is ${maxNumberTicketsPerBuyOrClaim}`;
  }, [userNotEnoughHbar, maxNumberTicketsPerBuyOrClaim]);

  const buyTicketsHandler = async () => {
    if (!currentLotteryId) return;
    const ticketsForPurchase = getTicketsForPurchase();

    if (!ticketsToBuy) {
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

    const callOptions = {
      value: parseUnits(
        priceTicketInHbar.times(ticketsToBuy || 0).toString(),
        18
      ),
    };

    const args: any = [currentLotteryId, ticketsForPurchase];
    try {
      const response = await writeContractAsync({
        abi: LotteryABI,
        address: CONTRACT_ADDRESS,
        account,
        functionName: "buyTickets",
        args,
        ...callOptions,
      });

      if (typeof response === "string") {
        toast.success(`Purchase successful!`, {
          className: "toast-success",
        });

        if (userTickets.length === 0) {
          await addLotteryRound({ address: account, round: currentLotteryId });
        }
        setOpen(false);
        refetch();
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

  return (
    <Dialog open={isOpen} onOpenChange={(value) => setOpen(value)}>
      <DialogTrigger asChild disabled={!currentLotteryId}>
        {!currentLotteryId ? (
          <PrimaryButton disabled text="On sale soon!" className="w-fit" />
        ) : (
          trigger
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[20.4375rem] w-full bg-white rounded-2xl py-8 px-4 text-mine-shaft overflow-auto max-h-dvh">
        <DialogHeader>
          <DialogTitle className="sr-only">Buy Tickets</DialogTitle>
        </DialogHeader>
        {buyingStage === BuyingStage.EDIT ? (
          <RandomizeTickets
            totalCost={totalCost}
            randomize={() => randomize(parseInt(ticketsToBuy, 10), userTickets)}
            tickets={tickets}
            allComplete={allComplete}
            confirmHandler={buyTicketsHandler}
            isConfirming={isPending}
            goBack={() => setBuyingStage(BuyingStage.BUY)}
          />
        ) : (
          <div>
            <h3 className="mb-1 text-base font-semibold text-center">
              Buy tickets
            </h3>
            <div className="space-y-[1.125rem]">
              <div className="space-y-1.5">
                <h5 className="text-sm text-blue-gray-500">Buy</h5>
                <div className="flex items-center justify-between p-2 border border-gray-200 rounded-lg">
                  <TicketIcon />
                  <div>
                    <input
                      type="number"
                      value={ticketsToBuy}
                      onChange={(event) => {
                        const value = event.target.value;
                        handleInputChange(value);
                      }}
                      className="p-0 text-right border-0 outline-none"
                      min={1}
                    />
                    <span className="text-xs text-blue-gray-500">
                      ~ {priceTicketInHbar.times(ticketsToBuy || 0).toString()}{" "}
                      HBAR
                    </span>
                  </div>
                </div>
                {userNotEnoughHbar || maxTicketPurchaseExceeded ? (
                  <p className="text-xs text-error-500">{errorMessage}</p>
                ) : null}
                <span className="text-xs text-blue-gray-500">
                  Available HBAR:{" "}
                  <span className="text-blue-gray-900">
                    {Number(balance)?.toFixed(2)}
                  </span>
                </span>
              </div>
              <div className="gap-1 p-2 rounded-lg bg-blue-gray-25">
                <span className="flex items-center justify-between">
                  <span className="text-xs text-blue-gray-500">
                    Ticket per HBAR:
                  </span>
                  <span className="text-xs text-right text-blue-gray-900">
                    {priceTicketInHbar.toString()} HBAR (
                    {currencyFormatter(
                      priceTicketInHbar.times(hbarPrice).toString(),
                      2
                    )}
                    )
                  </span>
                </span>
                <span className="flex items-center justify-between">
                  <span className="text-xs text-blue-gray-500">Cost:</span>
                  <span className="text-xs text-right text-blue-gray-900">
                    {priceTicketInHbar.times(ticketsToBuy || 0).toString()} HBAR
                    (
                    {currencyFormatter(
                      priceTicketInHbar
                        .times(ticketsToBuy || 0)
                        .times(hbarPrice)
                        .toString(),
                      2
                    )}
                    )
                  </span>
                </span>
                <span className="flex items-center justify-between">
                  <span className="text-xs text-blue-gray-500">
                    {percentageDiscount}% Bulk Discount:
                  </span>
                  <span className="text-xs text-right text-blue-gray-900">
                    {Number(discountValue)?.toFixed(2)} HBAR (
                    {currencyFormatter(Number(discountValue) * hbarPrice, 2)})
                  </span>
                </span>
                <span className="flex items-center justify-between">
                  <span className="text-xs text-blue-gray-500">
                    Amount to pay:
                  </span>
                  <span className="text-sm font-medium text-right text-blue-gray-900">
                    {Number(totalCost)?.toFixed(2)} HBAR (
                    {currencyFormatter(Number(totalCost) * hbarPrice, 2)})
                  </span>
                </span>
              </div>
              {isConnected ? (
                <span className="block space-y-2">
                  <PrimaryButton
                    disabled={ticketBuyIsDisabled || disableBuying}
                    text="Buy now"
                    className="py-2"
                    onClick={buyTicketsHandler}
                    disabledText={isPending ? "Confirming..." : ""}
                  />
                  {!ticketBuyIsDisabled && ticketsToBuy ? (
                    <PrimaryButton
                      text="Randomize your numbers"
                      className="py-2 bg-white white"
                      onClick={() => setBuyingStage(BuyingStage.EDIT)}
                      disabled={disableBuying}
                    />
                  ) : null}
                </span>
              ) : (
                <ConnectWallet>
                  <PrimaryButton as="span" text="Connect wallet" />
                </ConnectWallet>
              )}
              <span className="block p-2 text-xs rounded-lg bg-yellow-50 text-blue-gray-900">
                &quot;Buy now&quot; selects unique random numbers for your
                tickets. Prices are fixed at {priceTicketInHbar.toString()} HBAR{" "}
                before each round, and purchases are final.
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BuyTickets;
