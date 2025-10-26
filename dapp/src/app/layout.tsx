import { grift } from "@/fonts";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Betedra - PLAY · PREDICT · EARN",
    template: "Betedra - %s",
  },
  description:
    "Join the thrill of on-chain gaming — powered by HBAR. Place your bets, test your predictions, and win with provable fairness secured on Hedera.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`antialiased ${grift.className}`}
      >
        {children}
      </body>
    </html>
  );
}
