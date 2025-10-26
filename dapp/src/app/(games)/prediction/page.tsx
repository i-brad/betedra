import Image from "next/image";
import Link from "next/link";
import React from "react";
import Predictions from "./_components/Predictions";

function page() {
  return (
    <>
      <Predictions />
      <Link
        href="https://insights.pyth.network/price-feeds/Crypto.HBAR%2FUSD"
        target="_blank"
        className="mt-8 md:mb-0 bg-white border border-blue-gray-200 rounded-md flex items-center space-x-3 px-4 py-3 bottom-6 right-5 static md:absolute"
      >
        <Image
          src="/images/pyth.jpg"
          alt="Pyth"
          width={30}
          height={30}
          className="rounded-full"
        />
        <span className="block text-blue-gray-900">
          <h5 className="font-semibold text-sm">Market Data</h5>
          <h6 className="text-xs">Pyth Price Oracle</h6>
        </span>
      </Link>
    </>
  );
}

export default page;
