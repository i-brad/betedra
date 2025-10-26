import PredictionsABI from "@/smart-contract/abi/prediction";
import { useReadContract } from "wagmi";

const address = process.env.NEXT_PUBLIC_PREDICTION_ADDRESS as `0x${string}`;

const useGetBetByEpoch = (account: `0x${string}`, epoch: number) => {
  const { data: response } = useReadContract({
    address,
    abi: PredictionsABI,
    functionName: "ledger",
    args: [BigInt(epoch), account] as const,
    query: {
      enabled: epoch !== null,
    },
  });

  if (!response) return null;

  const data = response as any;

  return {
    position: data[0] as 0 | 1,
    amount: data[1],
    claimed: data[2],
  };
};

export default useGetBetByEpoch;
