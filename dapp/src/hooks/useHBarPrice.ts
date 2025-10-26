import PredictionsABI from "@/smart-contract/abi/prediction";
import { formatUnits } from "ethers";
import { useReadContract } from "wagmi";

const predictionAddress = process.env
  .NEXT_PUBLIC_PREDICTION_ADDRESS as `0x${string}`;

const useHBarPrice = () => {
  const { data } = useReadContract({
    abi: PredictionsABI,
    address: predictionAddress,
    functionName: "getPriceFromOracle",
  });

  if (!data) {
    return 0;
  }

  const price = Number(formatUnits(data as any, 8));

  return price;
};

export default useHBarPrice;
