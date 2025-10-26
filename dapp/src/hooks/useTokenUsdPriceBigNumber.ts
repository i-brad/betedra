import PredictionsABI from "@/smart-contract/abi/prediction";
import BigNumber from "bignumber.js";
import { formatUnits } from "ethers";
import { useReadContract } from "wagmi";

const predictionAddress = process.env
  .NEXT_PUBLIC_PREDICTION_ADDRESS as `0x${string}`;

const useTokenUsdPriceBigNumber = () => {
  const { data } = useReadContract({
    abi: PredictionsABI,
    address: predictionAddress,
    functionName: "getPriceFromOracle",
  });

  if (!data) {
    return BigNumber(0);
  }

  const price = Number(formatUnits(data as any, 8));

  return BigNumber(price);
};

export default useTokenUsdPriceBigNumber;
