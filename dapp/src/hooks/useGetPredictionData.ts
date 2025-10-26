import PredictionsABI from "@/smart-contract/abi/prediction";
import { PAST_ROUND_COUNT } from "@/state/predictions/config";
import { range } from "lodash";
import { useReadContracts } from "wagmi";

const address = process.env.NEXT_PUBLIC_PREDICTION_ADDRESS as `0x${string}`;

const useGetPredictionData = () => {
  const { data: contractsResponse, refetch } = useReadContracts({
    contracts: [
      {
        address,
        abi: PredictionsABI,
        functionName: "currentEpoch",
      },
      {
        address,
        abi: PredictionsABI,
        functionName: "intervalSeconds",
      },
      {
        address,
        abi: PredictionsABI,
        functionName: "minBetAmount",
      },
      {
        address,
        abi: PredictionsABI,
        functionName: "paused",
      },
    ],
    allowFailure: false,
    query: {
      refetchInterval: 300000,
      refetchIntervalInBackground: true,
    },
  });

  if (!contractsResponse) return null;

  const currentEpoch = Number(contractsResponse[0]);
  const intervalSeconds = Number(contractsResponse[1]);
  const minBetAmount = Number(contractsResponse[2]);
  const paused = contractsResponse[3];

  const epochs =
    currentEpoch > PAST_ROUND_COUNT
      ? range(currentEpoch, currentEpoch - PAST_ROUND_COUNT)
      : [currentEpoch];

  return {
    epochs,
    currentEpoch,
    intervalSeconds,
    minBetAmount,
    paused,
    refetch,
  };
};

export default useGetPredictionData;
