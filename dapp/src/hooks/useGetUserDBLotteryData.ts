import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

const fetchData = async (address: string) => {
  const response = await fetch(`/api/lottery/${address}`);
  return await response?.json();
};

const useGetUserDBLotteryData = () => {
  const { address } = useAccount();
  return useQuery({
    queryKey: ["user-db-lottery-data", address],
    queryFn: () => fetchData(address!),
    enabled: !!address,
  });
};

export default useGetUserDBLotteryData;
