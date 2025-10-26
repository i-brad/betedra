import React from "react";
import { getLeaderboard } from "../../../actions/leaderboard";
import { Header } from "./_components/Header";
import Leaderboard from "./_components/Leaderboard";

export const dynamic = "force-dynamic";

async function page({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const currentPage = (await searchParams)?.page;
  const result = await getLeaderboard(Number(currentPage ?? 1));
  return (
    <div className="lg:pt-[4.230625rem] pt-[2.875rem] px-4 max-w-[81.25rem] mx-auto space-y-[1.5625rem]">
      <Header />
      <Leaderboard
        data={
          result || {
            data: [],
            pagination: {
              limit: 100,
              totalPages: 1,
              currentPage: 1,
            },
          }
        }
      />
    </div>
  );
}

export default page;
