import PredictionsABI from "@/smart-contract/abi/prediction";
import { useReadContracts } from "wagmi";

const address = process.env.NEXT_PUBLIC_PREDICTION_ADDRESS as `0x${string}`;

const useGetLegerData = (epochs: any[], account: string) => {
  const { data: response, refetch: refreshLedger } = useReadContracts({
    contracts: epochs.map(
      (epoch) =>
        ({
          address,
          abi: PredictionsABI,
          functionName: "ledger",
          args: [BigInt(epoch), account] as const,
        } as const as any)
    ),
    allowFailure: false,

    query: {
      enabled: epochs !== null && epochs?.length > 0,
      refetchInterval: 300000,
      refetchIntervalInBackground: true,
    },
  });

  if (!response) return { ledger: null, refreshLedger };

  return {
    ledger: response.map((r: any) => ({
      position: r[0] as 0 | 1,
      amount: r[1],
      claimed: r[2],
    })),
    refreshLedger,
  };
};

export default useGetLegerData;
