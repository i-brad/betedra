import { type ClassValue, clsx } from "clsx";
import { formatUnits } from "ethers";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const currencyFormatter = (
  value: number | string,
  fractionDigits = 0,
  currency = ""
) => {
  value = Number(value);
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: fractionDigits,
  }).format(value);
  return formatted.replace(currency, "");
};

export const formatPriceDifference = (
  value: string,
  digitDecimal: number = 2,
  format = true
) => {
  const price = Number(formatUnits(value, 8));

  if (!format) return price;

  return currencyFormatter(price, digitDecimal);
};

export const formatBigIntToFixed = (value: string, digitDecimal: number) => {
  const price = Number(formatUnits(value, 8));

  return currencyFormatter(price, digitDecimal);
};

export const formatBigIntToFixedNumber = (value: string) => {
  const price = Number(formatUnits(value, 8));

  return price;
};

export const formatDate = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  return date.toLocaleString("en-US", options);
};

export function formatNumber(
  number: number,
  minimumFractionDigits: number = 2
) {
  if (number >= 1_000_000_000_000) {
    return (
      (number / 1_000_000_000_000)
        .toLocaleString("en-US", {
          currency: "USD",
          style: "currency",
          minimumFractionDigits,
        })
        .replace(/\.0$/, "") + "T"
    );
  } else if (number >= 1_000_000_000) {
    return (
      (number / 1_000_000_000)
        .toLocaleString("en-US", {
          currency: "USD",
          style: "currency",
          minimumFractionDigits,
        })
        .replace(/\.0$/, "") + "B"
    );
  } else if (number >= 1_000_000) {
    return (
      (number / 1_000_000)
        .toLocaleString("en-US", {
          currency: "USD",
          style: "currency",
          minimumFractionDigits,
        })
        .replace(/\.0$/, "") + "M"
    );
  } else if (number >= 1_000) {
    return (
      (number / 1_000)
        .toLocaleString("en-US", {
          currency: "USD",
          style: "currency",
          minimumFractionDigits,
        })
        .replace(/\.0$/, "") + "k"
    );
  } else {
    return number.toLocaleString("en-US", {
      currency: "USD",
      style: "currency",
      minimumFractionDigits,
    });
  }
}

export function shortenAddress(address: string) {
  if (address.length < 10) {
    // If the address is too short to be shortened, return it as is
    return address;
  }

  const start = address.slice(0, 4);
  const end = address.slice(-4);
  return `${start}.....${end}`;
}

export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, "...", totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
};
