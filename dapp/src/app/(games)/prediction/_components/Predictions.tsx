"use client";
import ClockIcon from "@/components/custom_icons/ClockIcon";
import LeaderboardIcon from "@/components/custom_icons/LeaderboardIcon";
import LoadingIcon from "@/components/custom_icons/LoadingIcon";
import { Button } from "@/components/ui/button";
import useCountdown from "@/hooks/useCountdown";
import useGetSortedRoundsCurrentEpoch from "@/hooks/useGetSortedRoundsCurrentEpoch";
import usePollOraclePrice from "@/hooks/usePollOraclePrice";
import { currencyFormatter } from "@/utils";
import Image from "next/image";
import Link from "next/link";
import React, { Key, useEffect, useMemo, useRef, useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import { PredictionCard } from "./Cards";
import History from "./History";

const Predictions = () => {
  const [firstLoad, setFirstLoad] = useState(true);
  const { price } = usePollOraclePrice();

  const { rounds, currentEpoch, loading, refetch, refreshLedger } =
    useGetSortedRoundsCurrentEpoch();

  useEffect(() => {
    if (!rounds) return;
    const intervalSeconds = 0;
    const previousEpoch = currentEpoch;

    const round = rounds.find((round) => round.epoch === previousEpoch + 1);

    if (!round) return;

    const currentTimestamp = Math.floor(Date.now() / 1000); // Current time in seconds
    const nextRoundStart = round?.startTimestamp + intervalSeconds; // When the next round starts
    const timeUntilNextRound = (nextRoundStart - currentTimestamp) * 1000; // Convert to ms

    if (timeUntilNextRound <= 0) {
      // console.log("Immediate refetch because the round has already started");
      refetch?.();
      return;
    }

    // console.log("Next refetch in:", timeUntilNextRound / 1000, "seconds");

    const timeout = setTimeout(() => {
      // console.log("Refetching at round start...");
      refetch?.();
    }, timeUntilNextRound);

    return () => clearTimeout(timeout); // Cleanup on unmount
  }, [currentEpoch, rounds, refetch]);

  const previousEpoch = useMemo(
    () => (currentEpoch > 0 ? currentEpoch - 1 : currentEpoch),
    [currentEpoch]
  );
  const swiperIndex = useMemo(
    () => rounds?.findIndex((round) => round.epoch === previousEpoch),
    [rounds, previousEpoch]
  );

  const timeStamp = useMemo(() => {
    const previousRoundTimestamp = rounds?.[swiperIndex]?.closeTimestamp;
    const currentRoundTimestamp = rounds?.[swiperIndex + 1]?.closeTimestamp;
    return previousRoundTimestamp
      ? previousRoundTimestamp
      : currentRoundTimestamp;
  }, [rounds, swiperIndex]);

  const { secondsRemaining, timeLeft } = useCountdown(timeStamp);

  const swiperRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!loading) setFirstLoad(false);
  }, [loading]);

  const handleSlideChange = () => {
    if (swiperRef.current) {
      setActiveIndex(swiperRef.current.swiper.realIndex);
    }
  };

  const scrollToSlide = (index: number) => {
    if (swiperRef.current) {
      swiperRef.current.swiper.slideTo(index, 600);
      setActiveIndex(index);
    }
  };

  if (loading && firstLoad) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingIcon className="animate-spin size-8" />
      </div>
    );
  }

  return (
    <div className="pt-[4.230625rem] px-4 xl:px-0">
      <div className="flex mb-[1.5625rem] flex-col max-w-[81.25rem] border-b border-gray-200 pb-[0.6875rem] mx-auto lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex flex-col space-y-2 sm:flex-row justify-between sm:space-x-3 items-center">
          <div className="bg-gray-25 relative rounded-[2.5rem] text-blue-gray-900 pl-[3rem] pr-4 py-[0.3125rem] flex items-center w-full max-w-full justify-between sm:w-fit">
            <Image
              src="/svgs/hbar.svg"
              alt="HBAR"
              width={44}
              height={44}
              className="absolute top-1/2 -translate-y-1/2 left-1"
            />
            <div className="px-3 flex items-center space-x-6">
              <span className="inline-block font-medium text-base lg:text-lg">
                HBAR/USDC
              </span>
              <span className="inline-block font-medium text-base lg:text-xl">
                {currencyFormatter(price, 4)}
              </span>
            </div>
          </div>
          <div className="md:hidden flex items-center space-x-3">
            <Link
              href="/prediction/leaderboard"
              className="flex items-center hover:border-blue-500 border text-center border-gray-200 px-4 py-2.5 rounded-sm space-x-3 text-sm lg:text-base text-blue-gray-900"
            >
              <LeaderboardIcon />
              <span>Leaderboard</span>
            </Link>
            <History currentEpoch={currentEpoch} />
          </div>
        </div>
        <div className="rounded-lg p-1 bg-gray-25">
          <span
            onClick={() => scrollToSlide(3)}
            className="cursor-pointer bg-white flex items-center justify-center space-x-2 rounded-lg px-[1.125rem] py-[0.21875rem]"
          >
            <ClockIcon />
            {secondsRemaining > 0 ? (
              <span className="flex items-center space-x-1">
                <span className="inline-block text-lg font-medium text-blue-gray-900">
                  {timeLeft}
                </span>
                <span className="text-xs lg:text-sm text-blue-gray-500">
                  / 5m
                </span>
              </span>
            ) : (
              <span className="inline-block text-lg lg:text-lg text-blue-gray-900 font-medium">
                Closing
              </span>
            )}
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <Link
            href="/prediction/leaderboard"
            className="flex items-center hover:border-blue-500 border text-center border-gray-200 px-4 py-2.5 rounded-sm space-x-3 text-sm lg:text-base text-blue-gray-900"
          >
            <LeaderboardIcon />
            <span>Leaderboard</span>
          </Link>
          <History currentEpoch={currentEpoch} />
        </div>
      </div>

      <Swiper
        ref={swiperRef}
        spaceBetween={25}
        slidesPerView="auto"
        centeredSlides={true}
        speed={600}
        grabCursor={true}
        draggable={true}
        touchRatio={1}
        initialSlide={swiperIndex}
        onSlideChange={handleSlideChange}
        className="w-full pb-[1.71875rem] *:items-center"
      >
        {rounds?.map((prediction: any, index: Key) => {
          return (
            <SwiperSlide key={index} className="w-full max-w-[20rem]">
              <PredictionCard
                round={prediction}
                currentEpoch={currentEpoch}
                refreshLedger={refreshLedger}
              />
            </SwiperSlide>
          );
        })}
      </Swiper>

      {rounds.length > 0 ? (
        <div className="flex items-center justify-between space-x-4 w-fit pt-[5.75rem] mx-auto">
          <Button
            disabled={activeIndex === 0}
            onClick={() => scrollToSlide(activeIndex - 1)}
            className="bg-transparent border hover:bg-blue-500 border-blue-gray-200 rounded-md text-blue-gray-800 px-4 py-2.5 min-w-[3.0625rem] !h-auto"
          >
            <MdKeyboardArrowLeft size={18} />
          </Button>

          <Button
            disabled={activeIndex === rounds?.length - 1}
            onClick={() => scrollToSlide(activeIndex + 1)}
            className="bg-transparent border hover:bg-blue-500 border-blue-gray-200 text-blue-gray-800 rounded-md px-4 py-2.5 min-w-[3.0625rem] !h-auto"
          >
            <MdKeyboardArrowRight size={18} />
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default Predictions;
