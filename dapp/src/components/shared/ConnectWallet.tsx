"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { useAccount } from "wagmi";

export const ConnectWallet = ({
  children,
  expectedChainId,
}: {
  children: React.ReactNode;
  expectedChainId?: number;
}) => {
  const { chainId } = useAccount();
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");
        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="w-full"
                  >
                    {children}
                  </button>
                );
              }
              if (
                chain.unsupported ||
                (chainId !== expectedChainId && expectedChainId !== undefined)
              ) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="text-red-400 text-xs lg:text-sm flex items-center justify-center space-x-2 whitespace-nowrap border w-full border-red-400 rounded-lg px-5 py-3 font-semibold"
                  >
                    <span>Wrong network</span>
                  </button>
                );
              }
              return (
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  className="text-blue-900 lg:text-sm styled-shadowmax-w-full w-[10.4375rem] text-xs bg-blue-500 border border-blue-100 rounded-2xl px-5 py-3"
                >
                  <button
                    onClick={openChainModal}
                    style={{
                      display: chain.hasIcon ? "flex" : "none",
                      alignItems: "center",
                    }}
                    type="button"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 26,
                          height: 26,
                          borderRadius: 999,
                          overflow: "hidden",
                        }}
                      >
                        {chain.iconUrl && (
                          <Image
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            width={26}
                            height={26}
                          />
                        )}
                      </div>
                    )}
                  </button>
                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="whitespace-nowrap overflow-hidden font-semibold flex items-center space-x-2 text-ellipsis"
                  >
                    <span>{account.displayName}</span>
                    {/* {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ""} */}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
