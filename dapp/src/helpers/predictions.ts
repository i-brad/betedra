import { provider } from "@/providers/wagmi/config";
import PredictionsABI from "@/smart-contract/abi/prediction";
import { Contract } from "ethers";

const address = process.env.NEXT_PUBLIC_PREDICTION_ADDRESS as `0x${string}`;

export function getPredictionsContract() {
  return new Contract(address, PredictionsABI, provider);
}
