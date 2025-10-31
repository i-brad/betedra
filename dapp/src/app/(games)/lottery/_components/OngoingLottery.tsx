"use client";
import PrimaryButton from "@/components/shared/Buttons";
import { Skeleton } from "@/components/ui/skeleton";
import useGetNextLotteryEvent from "@/hooks/useGetNextLotteryEvent";
import useHBarPrice from "@/hooks/useHBarPrice";
import useLottery from "@/hooks/useLottery";
import useNextEventCountdown from "@/hooks/useNextEventCountdown";
import { LotteryStatus } from "@/state/lottery/types";
import useLotteryTransitionStore from "@/store/useLotteryTransitionStore";
import { currencyFormatter, formatDate } from "@/utils";
import getTimePeriods from "@/utils/getTimePeriods";
import Image from "next/image";
import React, { useEffect, useMemo } from "react";
import CountUp from "react-countup";
import BuyTickets from "./BuyTickets";
import RewardBrackets from "./RewardBrackets";
import ViewUserTickets from "./ViewUserTickets";

export const getNextDrawId = (status: string, currentLotteryId: string) => {
  if (status === LotteryStatus.OPEN) {
    return `${currentLotteryId}`;
  }
  if (status === LotteryStatus.PENDING) {
    return "";
  }
  return parseInt(currentLotteryId, 10) + 1;
};

export const getNextDrawDateTime = (status: string, endDate: Date) => {
  if (status === LotteryStatus.OPEN) {
    return formatDate(endDate);
  }
  return "";
};

interface CountdownProps {
  nextEventTime: number;
  preCountdownText?: string;
  postCountdownText?: string;
  currentLotteryId: string;
  status: string;
  endTime: string;
}

const Countdown = ({
  nextEventTime,
  preCountdownText,
  status,
  currentLotteryId,
  endTime,
}: CountdownProps) => {
  const secondsRemaining = useNextEventCountdown(nextEventTime);
  const { days, hours, minutes } = getTimePeriods(
    secondsRemaining && secondsRemaining > 0 ? secondsRemaining : 0
  );

  const endTimeMs = parseInt(endTime, 10) * 1000;
  const endDate = new Date(endTimeMs);

  return (
    <div className="text-blue-gray-900">
      <h4 className="text-base font-semibold">{preCountdownText}</h4>
      <h2 className="text-2xl font-bold md:text-3xl lg:text-4xl">
        {days ? (
          <>
            {days}
            <span className="lg:text-lg">d</span>{" "}
          </>
        ) : null}
        {hours}
        <span className="lg:text-lg">h</span> {minutes}
        <span className="lg:text-lg">m</span>
      </h2>
      <span className="block mb-1 text-sm font-medium text-blue-gray-600">
        {Boolean(endTime) && getNextDrawDateTime(status, endDate)}
      </span>
      <span className="block text-xs font-medium text-blue-gray-500">
        Round{" "}
        {currentLotteryId && `#${getNextDrawId(status, currentLotteryId)}`}
      </span>
    </div>
  );
};

const OngoingLottery = () => {
  const {
    currentRound,
    currentLotteryId,
    refetch,
    refetchLotteryData,
    userTickets,
  } = useLottery();
  const { isTransitioning } = useLotteryTransitionStore();
  const wHbarPrice = useHBarPrice();
  const prizeTotal = Number(currentRound?.amountCollectedInWHbar) * wHbarPrice;
  const ticketBuyIsDisabled = useMemo(() => {
    if (!currentRound) return true;
    return currentRound?.status !== LotteryStatus.OPEN || isTransitioning;
  }, [currentRound, isTransitioning]);

  useEffect(() => {
    if (isTransitioning) {
      refetchLotteryData();
      refetch();
    }
  }, [isTransitioning, refetch, refetchLotteryData]);

  const endTimeAsInt = currentRound?.endTime
    ? parseInt(currentRound?.endTime, 10)
    : 0;
  const { nextEventTime, postCountdownText, preCountdownText } =
    useGetNextLotteryEvent(endTimeAsInt, currentRound?.status);

  return (
    <section className="mb-[2.625rem] px-4 xl:px-0">
      <div className="mx-auto max-w-[83.5625rem] overflow-hidden mb-[3.4375rem] isolate rounded-2xl flex justify-center items-center relative lottery-gradient min-h-[23rem]">
        <Image
          src="/svgs/radial-sun-burst.svg"
          alt="Radial Sun burst"
          fill
          className="absolute top-0 left-0 object-cover object-top w-full h-full -z-10"
        />
        <div className="relative text-center text-blue-gray-25">
          <Image
            src="/images/glowing-star.gif"
            alt="Glowing star"
            className="absolute bottom-0 -left-36 md:-left-52 -rotate-y-180"
            width={150}
            height={150}
          />
          <Image
            src="/images/glowing-star.gif"
            alt="Glowing star"
            className="absolute bottom-0 -right-36 md:-right-52"
            width={150}
            height={150}
          />
          <span className="block text-base font-semibold mb-[0.3125rem]">
            The Betedra Lottery {currentRound ? "of" : null}
          </span>

          <CountUp
            start={0}
            preserveValue
            delay={0}
            end={prizeTotal || 0}
            prefix="$"
            decimals={4}
            duration={1}
          >
            {({ countUpRef }) => (
              <span className="font-bold block text-2xl md:text-3xl lg:text-5xl mb-[0.3125rem]">
                <span ref={countUpRef} />
              </span>
            )}
          </CountUp>
          <span className="block text-base font-semibold">in prizes</span>

          <BuyTickets
            btnClassName="mt-8"
            trigger={
              <PrimaryButton
                text="Buy tickets"
                className="max-w-[10.4375rem] mx-auto mt-8"
                disabled={ticketBuyIsDisabled}
                disabledText="On sale soon!"
              />
            }
          />
        </div>
      </div>
      <div className="flex flex-wrap lg:flex-nowrap gap-5 mx-auto max-w-[75.125rem]">
        <div className="w-full lg:max-w-[15.25rem] px-6 py-10 border text-center flex items-center justify-between space-y-[3.375rem] flex-col border-blue-gray-200 rounded-2xl">
          {nextEventTime && (postCountdownText || preCountdownText) ? (
            <Countdown
              nextEventTime={nextEventTime}
              postCountdownText={postCountdownText}
              preCountdownText={preCountdownText}
              currentLotteryId={currentLotteryId?.toString() || ""}
              status={currentRound?.status || ""}
              endTime={currentRound?.endTime || ""}
            />
          ) : (
            <Skeleton className="w-32 h-16" />
          )}
          {prizeTotal ? (
            <div className="text-blue-gray-900">
              <h4 className="mb-1 text-base font-semibold">Prize Pot</h4>
              <h2 className="font-bold text-2xl lg:text-[2rem]">
                {currencyFormatter(prizeTotal)}
              </h2>
              <span className="text-base font-medium text-blue-gray-600">
                ~{Number(currentRound?.amountCollectedInWHbar).toLocaleString()}{" "}
                HBAR
              </span>
            </div>
          ) : (
            <Skeleton className="w-32 h-16" />
          )}
        </div>
        <div className="w-full overflow-hidden border border-blue-gray-200 rounded-2xl">
          <div className="bg-blue-gray-100 p-4 md:px-8 md:py-2.5 flex space-y-3 md:space-y-0 md:items-center flex-col md:flex-row justify-between">
            <span className="text-base font-medium text-blue-gray-600">
              Your tickets
            </span>
            <span className="text-base font-medium text-blue-gray-600">
              You have{" "}
              <span className="inline-block font-bold text-blue-gray-900">
                {userTickets?.length}
              </span>{" "}
              tickets in this round
            </span>
            <span className="flex items-center space-x-[1.125rem] text-blue-600">
              {userTickets.length > 0 ? (
                <ViewUserTickets
                  lotteryId={currentLotteryId?.toString() || ""}
                  tickets={userTickets}
                />
              ) : null}
              <BuyTickets
                trigger={
                  <PrimaryButton
                    text="Buy tickets"
                    className="w-fit whitespace-nowrap"
                    disabled={ticketBuyIsDisabled || !currentRound}
                    disabledText="On sale soon!"
                  />
                }
              />
            </span>
          </div>
          {currentRound ? (
            <div className="px-8 py-4">
              <p className="text-base text-blue-gray-600 mb-[1.4375rem]">
                Match the winning number in the same order to share prizes.
                Current prizes up for grabs:
              </p>
              <RewardBrackets round={currentRound} />
            </div>
          ) : (
            <div className="px-8 py-4">
              <Skeleton className="w-full h-40" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default OngoingLottery;
