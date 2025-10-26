import usePollPredictions from "./usePollPredictions";

const useGetSortedRoundsCurrentEpoch = () => {
  let loading = false;
  const data = usePollPredictions();

  if (!data) {
    loading = true;
    return {
      loading,
      rounds: [],
      currentEpoch: 0,
    };
  }

  const rounds = Object.values(data?.rounds);
  if (rounds?.length > 0) {
    loading = false;
  }

  return {
    loading,
    refetch: data?.refetch,
    refreshLedger: data?.refreshLedger,
    rounds: [
      ...rounds,
      {
        epoch: rounds[rounds?.length - 1]?.epoch + 1,
        startTimestamp: rounds[rounds?.length - 1]?.startTimestamp + 5 * 60,
      },
      {
        epoch: rounds[rounds?.length - 1]?.epoch + 2,
        startTimestamp: rounds[rounds?.length - 1]?.startTimestamp + 10 * 60,
      },
    ],
    currentEpoch: data?.currentEpoch || 0,
  };
};

export default useGetSortedRoundsCurrentEpoch;
