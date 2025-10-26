import { formatUnits, ZeroAddress } from "ethers";
import { erc20Abi } from "viem";
import { useAccount, useBalance, useReadContract } from "wagmi";

export const useGetBalanceAndDecimal = (tokenAddress: string) => {
  const { address } = useAccount();
  const { data } = useBalance({
    address,
    query: {
      enabled: tokenAddress === ZeroAddress,
    },
  });

  const balance_result = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address!],
    query: {
      enabled: tokenAddress !== ZeroAddress && !!address,
    },
  });

  const decimals_result = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "decimals",
    query: {
      enabled: tokenAddress !== ZeroAddress && !!address,
    },
  });

  if (!tokenAddress) return { balance: "0.00", decimals: 0 };

  const decimals: number =
    tokenAddress !== ZeroAddress
      ? typeof decimals_result?.data !== "number"
        ? 0
        : (decimals_result?.data as number)
      : data?.decimals ?? 18;

  const balance =
    (tokenAddress !== ZeroAddress
      ? formatUnits((balance_result?.data as any) ?? BigInt(0), decimals)
      : formatUnits(BigInt(data?.value || 0), data?.decimals)) ?? "0.00";

  return { balance, decimals };
};

const useGetBalance = (tokenAddress: string, decimals: number) => {
  const { address } = useAccount();
  const { data } = useBalance({
    address,
    query: {
      enabled: tokenAddress === ZeroAddress,
    },
  });

  const balance_result = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address!],
    query: {
      enabled: tokenAddress !== ZeroAddress && !!address,
    },
  });

  if (!tokenAddress) return { balance: "0.00" };

  const balance =
    (tokenAddress !== ZeroAddress
      ? formatUnits((balance_result?.data as any) ?? BigInt(0), decimals)
      : formatUnits(BigInt(data?.value || 0), decimals)) ?? "0.00";
  
  return { balance };
};

export default useGetBalance;
