import { provider } from "@/providers/wagmi/config";
import LotteryABI from "@/smart-contract/abi/lottery";
import {
  CONTRACT_ADDRESS,
  TICKET_LIMIT_PER_REQUEST,
} from "@/state/lottery/constants";
import {
  getRoundIdArray,
  processRawTicketsResponse,
  processViewLotterySuccessResponse,
} from "@/state/lottery/helpers";
import { UserRoundProps } from "@/state/lottery/types";
import { Contract } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import useGetUserDBLotteryData from "./useGetUserDBLotteryData";

const useGetUserLotteryData = (currentLotteryId?: number) => {
  const [isLoading, setLoading] = useState(false);
  const { address } = useAccount();
  const [lotteries, setLotteries] = useState<UserRoundProps[]>([]);
  const { data, isFetching } = useGetUserDBLotteryData();
  const idsForRoundsNodeCall = useMemo(
    () => getRoundIdArray(data?.data || [], currentLotteryId),
    [currentLotteryId, data]
  );

  useEffect(() => {
    if (idsForRoundsNodeCall.length > 0 && address) {
      const getUserLotteryData = async () => {
        try {
          setLoading(true);
          const arr = [];
          for (const id of idsForRoundsNodeCall) {
            const lottery_contract = new Contract(
              CONTRACT_ADDRESS,
              LotteryABI,
              provider
            );
            const lotteryRes = await lottery_contract.viewLottery(id);
            const userLotteryRes =
              await lottery_contract.viewUserInfoForLotteryId(
                address,
                id,
                0,
                TICKET_LIMIT_PER_REQUEST
              );
            arr.push({
              round: processViewLotterySuccessResponse(
                lotteryRes,
                id.toString()
              ),
              userTickets: processRawTicketsResponse(userLotteryRes),
            });
          }

          setLotteries(arr);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

      getUserLotteryData();
    }
  }, [idsForRoundsNodeCall, address]);
  return { isLoading: isLoading || isFetching, lotteries };
};

export default useGetUserLotteryData;
