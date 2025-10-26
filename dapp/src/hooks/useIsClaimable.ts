import PredictionsABI from "@/smart-contract/abi/prediction";
import { useAccount, useReadContract } from "wagmi";

const predictionAddress = process.env
  .NEXT_PUBLIC_PREDICTION_ADDRESS as `0x${string}`;

const useIsClaimable = (epoch: number) => {
  const { address: account } = useAccount();

  const { data } = useReadContract({
    abi: PredictionsABI,
    address: predictionAddress,
    functionName: "claimable",
    args: [BigInt(epoch), account!],
    query: {
      enabled: !!epoch && !!account,
    },
  });

  return data;
};

export default useIsClaimable;
