import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";
import Providers from "@/providers";
import { headers } from "next/headers";
import { ReactNode } from "react";
import { Toaster } from "sonner";

interface Props {
  children: ReactNode;
}

async function GameLayout({ children }: Props) {
  const headerStore = await headers();
  const cookies = headerStore.get("cookie");
  return (
    <Providers cookies={cookies}>
      <div className="pt-[1.4375rem] relative">
        <Toaster />
        <Header />
        <main className="min-h-[90dvh] relative">{children}</main>
        <Footer />
      </div>
    </Providers>
  );
}

export default GameLayout;
