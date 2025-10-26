import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaXTwitter } from "react-icons/fa6";
import { IoDocumentTextOutline } from "react-icons/io5";

const Footer = () => {
  return (
    <footer className="bg-blue-gray-900 py-6 px-8 lg:px-[4.9375rem] flex flex-col md:flex-row space-y-4 md:space-y-0 items-center justify-between">
      <Image
        src="/svgs/logo-white.svg"
        alt="Betedra Logo"
        width={113}
        height={46.11}
      />
      <span className="flex gap-6 items-center flex-wrap">
        <Link
          target="_blank"
          href="https://x.com/betedra_fun"
          className="hover:underline transition-all flex items-center space-x-2 duration-75 text-blue-gray-100"
        >
          <FaXTwitter size={16} />
          <span>Follow on Twitter (X)</span>
        </Link>
        <Link
          target="_blank"
          href="https://betedra.gitbook.io/docs/"
          className="hover:underline transition-all flex items-center space-x-2 duration-75 text-blue-gray-100"
        >
          <IoDocumentTextOutline size={16} />
          <span>Docs</span>
        </Link>
      </span>
      <Link
        href="https://hedera.com/"
        target="_blank"
        className="flex items-center space-x-4 text-blue-gray-25 text-xs"
      >
        <span>Powered by</span>
        <Image
          src="/svgs/hedera.svg"
          alt="Hedera"
          width={79.87}
          height={23.56}
        />
      </Link>
    </footer>
  );
};

export default Footer;
