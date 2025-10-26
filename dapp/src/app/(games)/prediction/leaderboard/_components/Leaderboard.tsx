"use client";
import ProfileIcon from "@/components/custom_icons/ProfileIcon";
import { First, Second, Third } from "@/components/custom_icons/Winners";
import Pagination from "@/components/shared/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationProps, TransactionProps } from "@/types/transaction";
import { currencyFormatter, shortenAddress } from "@/utils";
import React, { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";

const DataRow = ({
  position,
  data,
}: {
  position: number;
  data: Partial<TransactionProps>;
}) => {
  const { address } = useAccount();

  const win_rate = useMemo(() => {
    if (data?.total_rounds_played && data?.total_rounds_won) {
      return (data?.total_rounds_won / data?.total_rounds_played) * 100;
    }
    return 0;
  }, [data]);

  return (
    <TableRow
      className={
        address === data?.address
          ? "*:border-accent before:drop-shadow-table-row before:backdrop-blur-sm before:border-accent"
          : ""
      }
    >
      <TableCell>
        <span className="grid place-items-center rounded-full size-6 w-6 text-sm p-0.5 bg-bright-gray">
          {position === 1 ? (
            <First />
          ) : position === 2 ? (
            <Second />
          ) : position === 3 ? (
            <Third />
          ) : (
            <span>{position}</span>
          )}
        </span>
      </TableCell>
      <TableCell>
        <span className="flex items-center justify-start space-x-2">
          <span className="rounded-full size-6 min-w-6 flex items-center justify-center bg-bright-gray">
            <ProfileIcon />
          </span>
          <span className="text-sm lg:text-base">
            {shortenAddress(data?.address || "")}{" "}
            {address?.toLowerCase() === data?.address?.toLowerCase()
              ? "(You)"
              : null}
          </span>
        </span>
      </TableCell>
      <TableCell className="text-sm text-center lg:text-base">
        <span>+{Number(data?.winnings).toFixed(2)} HBAR</span>
        <span className="text-gray-50 text-xs block">
          {currencyFormatter(data?.winningsInUsd || 0, 2)}
        </span>
      </TableCell>
      <TableCell className="text-center text-sm lg:text-base">
        {win_rate?.toFixed(2)}%
      </TableCell>
      <TableCell className="text-center text-sm lg:text-base">
        {data?.total_rounds_won}
      </TableCell>
      <TableCell className="text-center text-sm lg:text-base">
        {data?.total_rounds_played}
      </TableCell>
    </TableRow>
  );
};

interface RankProps {
  rank: number;
  transaction: TransactionProps;
}

const Leaderboard = ({
  data,
}: {
  data: {
    data: TransactionProps[];
    pagination: PaginationProps;
  };
}) => {
  const { address } = useAccount();
  const [rank, setRank] = useState<RankProps | null>(null);

  useEffect(() => {
    if (address) {
      fetch(`/api/ranking?address=${address}`)
        .then((response) => response.json())
        .then((data) => setRank(data ?? null))
        .catch((error) => console.error("Error:", error));
    } else {
      setRank(null);
    }
  }, [address]);

  const ending_position =
    data?.pagination?.currentPage * data?.pagination?.limit;

  const starting_position = ending_position - data?.pagination?.limit + 1;

  const userRankIsVisible =
    rank !== null
      ? rank?.rank >= starting_position && rank?.rank <= ending_position
      : false;

  return (
    <div>
      <div className="overflow-auto hide-scrollbar mb-8">
        <Table className="border-spacing-y-3 border-separate">
          <TableHeader>
            <TableRow>
              <TableHead className="text-sm lg:text-base">RANK</TableHead>
              <TableHead className="text-left text-sm lg:text-base">
                USERS
              </TableHead>
              <TableHead className="text-center text-sm lg:text-base">
                WINNINGS (HBAR)
              </TableHead>
              <TableHead className="text-center text-sm lg:text-base">
                WIN RATE
              </TableHead>
              <TableHead className="text-center text-sm lg:text-base">
                TOTAL ROUNDS WON
              </TableHead>
              <TableHead className="text-center text-sm lg:text-base">
                TOTAL ROUNDS PLAYED
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data?.length > 0 ? (
              <>
                {!userRankIsVisible && rank?.rank ? (
                  <DataRow position={rank?.rank} data={rank?.transaction} />
                ) : null}
                {data?.data?.map((transaction, index) => (
                  <DataRow
                    key={transaction?._id}
                    position={
                      data?.pagination?.currentPage > 1
                        ? data?.pagination?.limit + index + 1
                        : index + 1
                    }
                    data={transaction}
                  />
                ))}
              </>
            ) : (
              <TableRow>
                <TableCell
                  className="text-sm lg:text-base text-center"
                  colSpan={6}
                >
                  No data yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* pagination */}
      <Pagination totalPages={data?.pagination?.totalPages} />
    </div>
  );
};

export default Leaderboard;
