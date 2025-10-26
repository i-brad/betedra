"use client";
import { cn } from "@/utils";
import Link from "next/link";
import React from "react";

interface ButtonProps extends React.ComponentProps<"button"> {
  text: string | React.ReactNode;
  as?: "link" | "button" | "span";
  href?: string;
  loading?: boolean;
  loadingText?: string;
  loadingClassName?: string;
  target?: string;
  disabledText?: string;
}

const PrimaryButton = ({
  text,
  as,
  href,
  loading = false,
  loadingText = "Loading...",
  className,
  loadingClassName,
  target = "_self",
  disabled,
  disabledText,
  ...props
}: ButtonProps) => {
  return (
    <>
      {loading ? (
        <span
          className={cn(
            "flex mt-6 justify-center p-2 cursor-progress items-center text-sm lg:text-base text-gray-200 space-x-2",
            loadingClassName
          )}
        >
          {/* <Loading className="animate-spin" /> */}
          <span>{loadingText}</span>
        </span>
      ) : as === "link" && href !== undefined ? (
        <Link
          href={href}
          target={target}
          className={cn(
            "bg-blue-500 border border-blue-100 px-5 py-3 text-center text-sm lg:text-base block font-semibold max-w-full rounded-[0.625rem] text-blue-900 styled-shadow",
            className
          )}
        >
          {text}
        </Link>
      ) : as === "span" ? (
        <span
          className={cn(
            "bg-blue-500 border border-blue-100 px-5 block text-center py-3 text-sm lg:text-base font-semibold max-w-full rounded-[0.625rem] text-blue-900 styled-shadow",
            className
          )}
        >
          {text}
        </span>
      ) : (
        <button
          {...props}
          disabled={disabled}
          className={cn(
            "bg-blue-500 border w-full disabled:opacity-50 border-blue-100 px-5 py-3 font-semibold text-sm lg:text-base max-w-full rounded-[0.625rem] text-blue-900 styled-shadow",
            className
          )}
        >
          {disabled ? (disabledText ? disabledText : text) : text}
        </button>
      )}
    </>
  );
};

export default PrimaryButton;
