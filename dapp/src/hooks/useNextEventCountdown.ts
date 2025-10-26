import useLotteryTransitionStore from "@/store/useLotteryTransitionStore";
import { useEffect, useRef, useState } from "react";

const useNextEventCountdown = (nextEventTime: number): number | null => {
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const { setLotteryIsTransitioning } = useLotteryTransitionStore();

  useEffect(() => {
    setLotteryIsTransitioning({ isTransitioning: false });
    const currentSeconds = Math.floor(Date.now() / 1000);
    const secondsRemainingCalc = nextEventTime - currentSeconds;
    setSecondsRemaining(secondsRemainingCalc);

    timer.current = setInterval(() => {
      setSecondsRemaining((prevSecondsRemaining) => {
        if (prevSecondsRemaining === null) return null;
        // Clear current interval at end of countdown and fetch current lottery to get updated state
        if (prevSecondsRemaining <= 1) {
          if (timer.current) clearInterval(timer.current);
          setLotteryIsTransitioning({ isTransitioning: true });
        }
        return prevSecondsRemaining - 1;
      });
    }, 1000);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [nextEventTime, setLotteryIsTransitioning]);

  return secondsRemaining;
};

export default useNextEventCountdown;
