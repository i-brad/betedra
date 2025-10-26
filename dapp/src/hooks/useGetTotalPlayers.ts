import { useQuery } from "@tanstack/react-query";

interface TotalPlayersResponse {
  lotteryId: number;
  totalPlayers: number;
}

function useGetTotalPlayers(lotteryId: number | undefined) {
  return useQuery<TotalPlayersResponse>({
    queryKey: ["totalPlayers", lotteryId],
    queryFn: async () => {
      if (!lotteryId) throw new Error("lotteryId is required");
      const res = await fetch(`/api/lotteries/${lotteryId}/players`);
      if (!res.ok) {
        throw new Error("Failed to fetch total players");
      }
      return res.json();
    },
    enabled: !!lotteryId, // don't run until lotteryId is provided
  });
}

export default useGetTotalPlayers;
