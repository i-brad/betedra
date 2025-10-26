import { fetchUserRounds, ROUNDS_PER_PAGE } from "@/helpers/rounds";
import { ReduxNodeLedger } from "@/state/types";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

const useRounds = (page = 1, length = 0) => {
  const [rounds, setRounds] = useState<null | {
    [key: string]: ReduxNodeLedger;
  }>(null);

  const { address } = useAccount();

  const maxPages =
    length <= ROUNDS_PER_PAGE ? 1 : Math.ceil(length / ROUNDS_PER_PAGE);

  const cursor = length - ROUNDS_PER_PAGE * page;

  // If the page request is the final one we only want to retrieve the amount of rounds up to the next cursor.
  const size =
    maxPages === page
      ? length - ROUNDS_PER_PAGE * (page - 1) // Previous page's cursor
      : ROUNDS_PER_PAGE;

  useEffect(() => {
    if (address && length > 0) {
      const getRounds = async () => {
        const _cursor = cursor < 0 ? 0 : cursor;
        const response = await fetchUserRounds(address, _cursor, size);
        setRounds(response);
      };

      //function call
      getRounds();
    }
  }, [address, length, cursor, size]);
  return { rounds, maxPages };
};

export default useRounds;
