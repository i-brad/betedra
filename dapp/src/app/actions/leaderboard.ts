"use server";

import { connectToDatabase } from ".";
import Leaderboard from "../api/db/models/leaderboard";

export async function getLeaderboard(page = 1, limit = 100) {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    const skip = (page - 1) * limit;

    // Count the total number of documents matching the filter
    const totalResults = await Leaderboard.countDocuments({
      total_rounds_played: { $gt: 0 },
    });

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalResults / limit);

    // Retrieve leaderboards and sort them by points in descending order
    const results = await Leaderboard.find()
      .sort({
        total_rounds_played: -1,
      })
      .skip(skip)
      .limit(limit);

    const data = JSON.parse(JSON.stringify(results));
    return {
      data,
      pagination: {
        totalPages,
        currentPage: page,
        limit,
      },
    };
  } catch {
    // console.error("Error fetching leaderboards:", error);
    return null;
  }
}

interface LeaderboardProps {
  address: string;
  winnings?: number;
  winningsInUsd?: number;
  totalRoundsWon?: number;
  totalRoundsPlayed?: number;
}

export async function updateLeaderboard({
  address,
  winnings,
  winningsInUsd,
  totalRoundsPlayed,
  totalRoundsWon,
}: LeaderboardProps) {
  if (!address) throw new Error("Address is required");

  const lowerCaseAddress = address.toLowerCase();

  try {
    await connectToDatabase();

    const updateFields: Record<string, any> = {};
    if (winnings !== undefined) updateFields.winnings = winnings;
    if (winningsInUsd !== undefined) updateFields.winningsInUsd = winningsInUsd;
    if (totalRoundsWon !== undefined)
      updateFields.total_rounds_won = totalRoundsWon;
    if (totalRoundsPlayed !== undefined)
      updateFields.total_rounds_played = totalRoundsPlayed;

    await Leaderboard.findOneAndUpdate(
      { address: new RegExp(`^${lowerCaseAddress}$`, "i") },
      {
        $setOnInsert: { address: lowerCaseAddress },
        $inc: updateFields,
      },
      { upsert: true, new: true }
    );
    // return updatedLeaderboard;
    return null;
  } catch {
    // console.error("Error updating leaderboard:", error);
    // throw new Error("Failed to update leaderboard");
    return null;
  }
}
