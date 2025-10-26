import { makeLedgerData, serializePredictionsRoundsResponse } from "@/helpers";
import { merge } from "lodash";
import { useAccount } from "wagmi";
import useGetClaimStatuses from "./useGetClaimStatuses";
import useGetLegerData from "./useGetLegerData";
import useGetPredictionData from "./useGetPredictionData";
import useGetRoundsData from "./useGetRoundsData";

const usePollPredictions = () => {
  const { address: account } = useAccount();
  const marketData = useGetPredictionData();
  const rounds = useGetRoundsData(marketData?.epochs ? marketData?.epochs : []);

  const { ledger: ledgerResponses, refreshLedger } = useGetLegerData(
    marketData?.epochs ? marketData?.epochs : [],
    account!
  );
  const claimableStatuses = useGetClaimStatuses(
    marketData?.epochs ? marketData?.epochs : [],
    account!
  );

  if (!rounds) return null;

  const initialRoundData: { [key: string]: any } = rounds.reduce(
    (accum, roundResponse) => {
      const nodeRound = serializePredictionsRoundsResponse(roundResponse);
      return {
        ...accum,
        [roundResponse.epoch.toString()]: nodeRound,
      };
    },
    {}
  );

  const initializedData = {
    ...marketData,
    rounds: initialRoundData,
    ledgers: {},
    claimableStatuses: {},
    refreshLedger,
  };

  if (!account || !ledgerResponses || !claimableStatuses) {
    return initializedData;
  }

  return merge({}, initializedData, {
    ledgers: makeLedgerData(
      account,
      ledgerResponses,
      marketData?.epochs ? marketData?.epochs : []
    ),
    claimableStatuses,
  });
};

export default usePollPredictions;
