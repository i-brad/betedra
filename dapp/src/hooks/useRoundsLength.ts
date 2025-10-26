import { fetchUsersRoundsLength } from "@/helpers/rounds";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

const useRoundsLength = () => {
  const { address } = useAccount();
  const [length, setLength] = useState(0);

  useEffect(() => {
    if (address) {
      const getLength = async () => {
        const response = await fetchUsersRoundsLength(address);

        setLength(Number(response));
      };

      //function call
      getLength();
    }
  }, [address]);

  return { length };
};

export default useRoundsLength;
