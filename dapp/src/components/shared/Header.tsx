"use client";
import { cn } from "@/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import PrimaryButton from "./Buttons";
import { ConnectWallet } from "./ConnectWallet";

const Header = () => {
  const pathname = usePathname();
  return (
    <header className="px-4 xl:px-0 mx-auto max-w-[79.9375rem]">
      <div className="flex items-center justify-between">
        <Image
          src="/svgs/logo.svg"
          alt="Betedra Logo"
          width={138}
          height={56.31}
        />
        <ul className="hidden lg:flex items-center justify-between max-w-[21rem] gap-[2.25rem]">
          {["prediction", "lottery"].map((item) => (
            <li key={item}>
              <Link
                href={`/${item}`}
                className={cn(
                  "capitalize text-blue-gray-500 text-sm hover:border-blue-500 border-b-3 border-transparent lg:text-base block pb-4 px-[3.09375rem]",
                  {
                    "text-blue-gray-900 border-blue-500 font-semibold":
                      pathname.includes(item),
                  }
                )}
              >
                {item}
              </Link>
            </li>
          ))}
        </ul>
        <ConnectWallet>
          <PrimaryButton
            as="span"
            text="Connect wallet"
            className="w-[10.4375rem]"
          />
        </ConnectWallet>
      </div>
      <ul className="lg:hidden flex items-center justify-between max-w-full gap-4 mt-6">
        {["prediction", "lottery"].map((item) => (
          <li key={item} className="w-full">
            <Link
              href={`/${item}`}
              className={cn(
                "capitalize text-blue-gray-500 text-sm hover:border-blue-500 border-b-3 border-transparent text-center lg:text-base block py-4 px-[3.09375rem]",
                {
                  "text-blue-gray-900 border-blue-500 font-semibold":
                    pathname === `/${item}`,
                }
              )}
            >
              {item}
            </Link>
          </li>
        ))}
      </ul>
    </header>
  );
};

export default Header;
