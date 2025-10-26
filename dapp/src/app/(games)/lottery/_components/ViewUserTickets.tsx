import QuestionMarkIcon from "@/components/custom_icons/QuestionMarkIcon";
import PrimaryButton from "@/components/shared/Buttons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getWinningTickets } from "@/state/lottery/fetchUnclaimedUserRewards";
import { LotteryTicket, LotteryTicketClaimData } from "@/state/lottery/types";
import React, { useEffect, useState } from "react";
import BuyTickets from "./BuyTickets";
import Numbers from "./Numbers";

interface TicketProps {
  ticket: LotteryTicket;
}

const Ticket = ({ ticket }: TicketProps) => {
  return (
    <div>
      <span className="flex items-center mb-1.5 justify-between text-sm text-blue-gray-900">
        <span>Ticket #{ticket.id}</span>
      </span>
      <Numbers value={ticket.number.toString()} />
    </div>
  );
};

interface Props {
  tickets: LotteryTicket[];
  lotteryId: string;
  isPastRoundView?: boolean;
  winningNumbers?: string;
}

type UserWinningTicket = {
  allWinningTickets?: LotteryTicket[] | null;
  ticketsWithUnclaimedRewards?: LotteryTicket[] | null;
  isFetched: boolean;
  claimData: LotteryTicketClaimData | null;
};

const ViewUserTickets = ({
  tickets,
  lotteryId,
  isPastRoundView = false,
  winningNumbers,
}: Props) => {
  const [userWinningTickets, setUserWinningTickets] =
    useState<UserWinningTicket>({
      allWinningTickets: null,
      ticketsWithUnclaimedRewards: null,
      isFetched: false,
      claimData: null,
    });

  useEffect(() => {
    const fetchData = async () => {
      if (!isPastRoundView || !lotteryId || !winningNumbers) return;

      const winningTickets = await getWinningTickets({
        roundId: lotteryId,
        userTickets: tickets,
        finalNumber: winningNumbers,
      });

      setUserWinningTickets({
        isFetched: true,
        allWinningTickets: winningTickets?.allWinningTickets,
        ticketsWithUnclaimedRewards:
          winningTickets?.ticketsWithUnclaimedRewards,
        claimData: winningTickets,
      });
    };

    fetchData();
  }, [lotteryId, isPastRoundView, winningNumbers, tickets]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-sm font-medium underline whitespace-nowrap text-inherit lg:text-base">
          View your tickets
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[20.4375rem] w-full bg-white rounded-2xl py-8 px-4 text-mine-shaft max-h-dvh overflow-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">My Tickets</DialogTitle>
        </DialogHeader>
        <div className="space-y-[1.125rem]">
          <h3 className="mb-1 text-base font-semibold text-center">
            Your tickets
          </h3>
          <span className="block text-sm text-blue-gray-800">
            Round #{lotteryId}
          </span>
          {isPastRoundView && winningNumbers ? (
            <div className="p-2 rounded-lg space-y-1.5 lottery-gradient">
              <h6 className="text-xs text-blue-gray-25">Winning numbers</h6>
              <Numbers value={winningNumbers} />
            </div>
          ) : null}
          {tickets.map((ticket) => (
            <Ticket key={ticket.id} ticket={ticket} />
          ))}
          {!isPastRoundView ? (
            <BuyTickets trigger={<PrimaryButton text="Buy more tickets" />} />
          ) : null}

          {isPastRoundView ? (
            <>
              <div className="bg-blue-gray-100 rounded-lg p-2 space-y-1.5">
                <span className="flex items-center justify-between text-sm">
                  <span className="text-blue-gray-500">Total ticket</span>
                  <span className="font-medium text-blue-gray-900">
                    {tickets.length}
                  </span>
                </span>
                {userWinningTickets?.allWinningTickets ? (
                  <span className="flex items-center justify-between text-sm">
                    <span className="text-blue-gray-500">Winning tickets</span>
                    <span className="font-medium text-blue-gray-900">
                      {userWinningTickets?.allWinningTickets?.length}
                    </span>
                  </span>
                ) : null}
                {userWinningTickets?.ticketsWithUnclaimedRewards &&
                userWinningTickets?.ticketsWithUnclaimedRewards.length > 0 ? (
                  <span className="flex items-center justify-between text-sm">
                    <span className="text-blue-gray-500">
                      Tickets with unclaimed rewards
                    </span>
                    <span className="font-medium text-blue-gray-900">
                      {userWinningTickets?.ticketsWithUnclaimedRewards?.length}
                    </span>
                  </span>
                ) : null}
              </div>
              <Tooltip>
                <TooltipTrigger className="w-full">
                  <span className="flex items-center justify-center space-x-1.5 text-blue-gray-900 text-xs">
                    <QuestionMarkIcon />
                    <span>Why didn’t I win?</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent className="bg-white p-2 rounded-[0.661875rem] max-w-[18rem]">
                  <p className="text-xs whitespace-pre-wrap text-blue-gray-900">
                    Ticket must match the winning number in the exact same
                    order, starting from the first digit.
                    <br />
                    <br />
                    If the winning number is “87654321“
                    <br />
                    <br />
                    “873333”matches the first 2 digits
                    <br />
                    <br />
                    “00001” matches the last digit, but since the first five
                    digits are wrong, it doesn’t win any prize.
                  </p>
                </TooltipContent>
              </Tooltip>{" "}
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewUserTickets;
