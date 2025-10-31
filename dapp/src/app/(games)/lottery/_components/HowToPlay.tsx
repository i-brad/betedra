"use client";
import PrimaryButton from "@/components/shared/Buttons";
import Image from "next/image";
import React from "react";
import BuyTickets from "./BuyTickets";
import useLotteryTransitionStore from "@/store/useLotteryTransitionStore";

const steps = [
  {
    title: "Purchase Your Tickets",
    description:
      "Ticket prices are set at the start of each round, priced at 5 USD in HBAR.",
  },
  {
    title: "Stay Tuned for the Exciting Draw!",
    description:
      "Join us for a daily draw that alternates between 0 AM GMT+1 and 12 PM GMT+1!",
  },
  {
    title: "Discover Your Winning Prizes!",
    description:
      "After the round concludes, return to this page to see if you’re a winner!",
  },
];

const HowToPlay = () => {
  const { isTransitioning } = useLotteryTransitionStore();
  return (
    <section className="bg-purple-600 py-10 lg:py-[4.6875rem] px-8 lg:px-[4.625rem]">
      <div className="text-center text-white mb-[3.5rem]">
        <h3 className="font-bold text-3xl lg:text-5xl mb-[0.4375rem]">
          How to Play
        </h3>
        <p className="max-w-[30.8125rem] mx-auto text-base text-blue-gray-25">
          If the digits on your tickets match the winning numbers in the correct
          order, you win a portion of the prize pool.
        </p>
      </div>
      <div className="flex mx-auto flex-wrap lg:flex-nowrap justify-between max-w-[80.75rem] gap-[1.875rem]">
        <div className="w-full bg-blue-gray-25 rounded-2xl py-[2.4375rem] px-[1.8125rem] max-w-[32.875rem]">
          <h4 className="font-bold text-blue-gray-900 text-2xl lg:text-[2rem] mb-[1.75rem]">
            Steps to take
          </h4>
          <div className="space-y-5 mb-[3.0625rem]">
            {steps.map((step, index) => (
              <div key={index}>
                <h5 className="font-semibold text-base text-blue-gray-900 mb-1.5">
                  {index + 1}. {step.title}
                </h5>
                <p className="text-base text-blue-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
          <BuyTickets
            trigger={
              <PrimaryButton
                text="Join round"
                disabled={isTransitioning}
                disabledText="On sale soon!"
                className="max-w-[9.3125rem]"
              />
            }
          />
        </div>
        <div className="w-full bg-blue-gray-25 rounded-2xl py-[2.4375rem] px-[1.8125rem]">
          <h4 className="font-bold text-blue-gray-900 text-2xl lg:text-[2rem] mb-3">
            Criteria to Win
          </h4>
          <span className="mb-[1.125rem] block">
            <p className="text-blue-gray-900 font-semibold text-base mb-1.5">
              To win, the digits on your ticket must match in the exact order!
            </p>
            <span className="space-y-4 text-blue-gray-600 text-base whitespace-pre-wrap">
              <p>
                Let’s look at a sample lottery draw with two tickets, A and B.
              </p>
              <p>
                Ticket A: The first three digits and the last digit match, but
                the fourth and fifth digits are incorrect, so it wins a
                &lsquo;Match first 3&rsquo; prize.
              </p>
              <p>
                Ticket B: Although the last five digits match, the first digit
                is wrong, meaning it doesn’t win anything.{" "}
              </p>
            </span>
          </span>
          <span className="mb-[1.125rem] flex justify-between gap-3.5">
            <span className="relative block w-full h-[7.241875rem]">
              <Image
                src="/svgs/lottery-sample-1.svg"
                alt="Lottery Sample"
                fill
              />
            </span>
            <span className="relative block w-full h-[7.241875rem]">
              <Image
                src="/svgs/lottery-sample-2.svg"
                alt="Lottery Sample"
                fill
              />
            </span>
          </span>
          <p className="text-blue-gray-600 text-base">
            Remember, prize brackets don’t stack: if you match the first three
            digits in order, you’ll only receive prizes from the &lsquo;Match
            3&rsquo; bracket, not from &lsquo;Match 1&rsquo; or &lsquo;Match
            2&rsquo;.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowToPlay;
