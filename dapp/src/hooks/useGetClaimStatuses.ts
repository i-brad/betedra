import PredictionsABI from "@/smart-contract/abi/prediction";
import { useReadContracts } from "wagmi";

const address = process.env.NEXT_PUBLIC_PREDICTION_ADDRESS as `0x${string}`;

const useGetClaimStatuses = (epochs: any[], account: string) => {
  const { data: response } = useReadContracts({
    contracts: epochs.map(
      (epoch) =>
        ({
          address,
          abi: PredictionsABI,
          functionName: "claimable",
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

  if (!response) return null;

  return response.reduce((accum: any, claimable, index) => {
    const epoch = epochs[index];

    return {
      ...accum,
      [epoch]: claimable,
    };
  }, {});
};

export default useGetClaimStatuses;
