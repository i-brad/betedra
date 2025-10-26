"use client";
import { cn, generatePagination } from "@/utils";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import LeftArrowIcon from "../custom_icons/LeftArrowIcon";

function PaginationNumber({
  page,
  href,
  isActive,
  position,
}: {
  page: number | string;
  href: string;
  position?: "first" | "last" | "middle" | "single";
  isActive: boolean;
}) {
  const className = cn(
    "flex size-[2.5rem] items-center rounded-lg justify-center",
    {
      "z-10 bg-blue-500 text-blue-gray-900": isActive,
      "hover:bg-blue-500 hover:text-blue-gray-900":
        !isActive && position !== "middle",
    }
  );

  return isActive || position === "middle" ? (
    <div className={className}>{page}</div>
  ) : (
    <Link href={href} className={className}>
      {page}
    </Link>
  );
}

const Pagination = ({
  totalPages = 1,
  hideLabel,
}: {
  totalPages?: number;
  hideLabel?: boolean;
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const currentPage = Number(searchParams.get("page")) || 1;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const allPages = hideLabel
    ? [currentPage]
    : generatePagination(currentPage, totalPages);

  if (totalPages === 0) {
    return null;
  }

  return (
    <div className="text-blue-gray-900 flex flex-col lg:flex-row items-center justify-between space-y-3 lg:space-y-0">
      {hideLabel ? null : (
        <span className="text-sm text-blue-gray-500">
          Showing {currentPage} of {totalPages} Pages
        </span>
      )}
      <div className="flex items-center space-x-[1.0625rem]">
        <button
          onClick={() => replace(createPageURL(currentPage - 1))}
          disabled={currentPage <= 1}
          className="flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed space-x-2 border border-mine-shaft rounded-lg py-2 px-4"
        >
          <LeftArrowIcon />
          <span className="hidden lg:inline-block">Prev</span>
        </button>
        <div className="flex space-x-[0.375rem] text-blue-gray-800 text-sm">
          {allPages.map((page, index) => {
            let position: "first" | "last" | "single" | "middle" | undefined;

            if (index === 0) position = "first";
            if (index === allPages.length - 1) position = "last";
            if (allPages.length === 1) position = "single";
            if (page === "...") position = "middle";

            return (
              <PaginationNumber
                key={`${page}-${index}`}
                href={createPageURL(page)}
                page={page}
                position={position}
                isActive={currentPage === page}
              />
            );
          })}
        </div>

        <button
          onClick={() => replace(createPageURL(currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed space-x-2 border border-mine-shaft rounded-lg py-2 px-4"
        >
          <span className="hidden lg:inline-block">Next</span>
          <LeftArrowIcon className="rotate-180" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
