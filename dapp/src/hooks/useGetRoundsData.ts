import PredictionsABI from "@/smart-contract/abi/prediction";
import { useReadContracts } from "wagmi";

const address = process.env.NEXT_PUBLIC_PREDICTION_ADDRESS as `0x${string}`;

const useGetRoundsData = (epochs: any[]) => {
  const { data: response } = useReadContracts({
    contracts: epochs.map(
      (epoch: any) =>
        ({
          address,
          abi: PredictionsABI,
          functionName: "rounds",
          args: [BigInt(epoch)] as const,
        } as const as any)
    ),
    allowFailure: false,

    query: {
      enabled: epochs !== null && epochs?.length > 0,
      refetchInterval: 5000,
      refetchIntervalInBackground: true,
    },
  });

  if (!response) return null;

  return response.map((r: any) => ({
    epoch: BigInt(r[0]),
    startTimestamp: BigInt(r[1]),
    lockTimestamp: BigInt(r[2]),
    closeTimestamp: BigInt(r[3]),
    lockPrice: r[4],
    closePrice: r[5],
    // lockOracleId: r[6],
    // closeOracleId: r[7],
    totalAmount: r[6],
    bullAmount: r[7],
    bearAmount: r[8],
    rewardBaseCalAmount: BigInt(r[9]),
    rewardAmount: r[10] || 0n,
    oracleCalled: Boolean(r[11]),
  }));
};

export default useGetRoundsData;
