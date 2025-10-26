import { create } from "zustand";

interface LotteryState {
  isTransitioning: boolean;
  setLotteryIsTransitioning: (state: { isTransitioning: boolean }) => void;
}

const useLotteryTransitionStore = create<LotteryState>((set) => ({
  isTransitioning: false,
  setLotteryIsTransitioning: ({ isTransitioning }) => set({ isTransitioning }),
}));

export default useLotteryTransitionStore;
