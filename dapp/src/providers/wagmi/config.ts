import {
  Chain,
  getDefaultConfig,
  getDefaultWallets,
} from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import { cookieStorage, createStorage, http } from "wagmi";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;

const { wallets } = getDefaultWallets();

export const hedera = {
  id: Number(process.env.NEXT_PUBLIC_CHAIN_ID!),
  name: "HEDERA",
  iconUrl: "/svgs/hedera-logo.svg",
  iconBackground: "#fff",
  nativeCurrency: { name: "HBAR", symbol: "HBAR", decimals: 8 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RPC_URL!] },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: process.env.NEXT_PUBLIC_EXPLORER!,
    },
  },
} as const satisfies Chain;

export const provider = new ethers.JsonRpcProvider(
  hedera.rpcUrls.default.http[0]
);

export const config = getDefaultConfig({
  appName: "Betedra",
  projectId,
  chains: [hedera],
  transports: {
    [hedera.id]: http(process.env.NEXT_PUBLIC_RPC_URL!),
  },
  wallets: [...wallets],
  ssr: true, // If your dApp uses server side rendering (SSR)
  storage: createStorage({
    storage: cookieStorage,
  }),
});
