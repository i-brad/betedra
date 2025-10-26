"use client";

import { lightTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cookieToInitialState, WagmiProvider } from "wagmi";
import { config } from "./wagmi/config";

const queryClient = new QueryClient();

type Props = {
  children: React.ReactNode;
  cookies: string | null;
};

const Providers = ({ children, cookies }: Props) => {
  const initialState = cookieToInitialState(config, cookies);
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          showRecentTransactions={false}
          modalSize="compact"
          theme={lightTheme()}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Providers;
