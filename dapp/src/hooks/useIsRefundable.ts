import PredictionsABI from "@/smart-contract/abi/prediction";
import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";

const predictionAddress = process.env
  .NEXT_PUBLIC_PREDICTION_ADDRESS as `0x${string}`;

const useIsRefundable = (epoch: number) => {
  const { address: account } = useAccount();
  const [isRefundable, setIsRefundable] = useState(false);

  const { data } = useReadContract({
    abi: PredictionsABI,
    address: predictionAddress,
    functionName: "refundable",
    args: [BigInt(epoch), account!],
    query: {
      enabled: !!epoch && !!account,
    },
  });

  useEffect(() => {
    if (typeof data === "boolean") {
      setIsRefundable(data || false);
    }
  }, [data]);

  return { isRefundable, setIsRefundable };
};

export default useIsRefundable;
