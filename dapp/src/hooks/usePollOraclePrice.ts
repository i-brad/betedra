import PredictionsABI from "@/smart-contract/abi/prediction";
import { formatUnits } from "ethers";
import { useReadContract } from "wagmi";

const predictionAddress = process.env
  .NEXT_PUBLIC_PREDICTION_ADDRESS as `0x${string}`;

const usePollPredictionPrice = () => {
  const { data, refetch } = useReadContract({
    abi: PredictionsABI,
    address: predictionAddress,
    functionName: "getPriceFromOracle",
    query: {
      refetchInterval: 1000,
      refetchIntervalInBackground: true,
    },
  });

  if (!data) {
    return { price: 0, blockPrice: 0n };
  }

  const price = Number(formatUnits(data as any, 8));

  return {
    blockPrice: data,
    price,
    refetch,
  };
};

export default usePollPredictionPrice;
