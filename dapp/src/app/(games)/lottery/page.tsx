import React from "react";
import CheckStatus from "./_components/CheckStatus";
import HowToPlay from "./_components/HowToPlay";
import OngoingLottery from "./_components/OngoingLottery";
import PastRounds from "./_components/PastRounds";

function page() {
  return (
    <div className="pt-[1.855625rem]">
      <OngoingLottery />
      <CheckStatus />
      <PastRounds />
      <HowToPlay />
    </div>
  );
}

export default page;
