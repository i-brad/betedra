"use server";
import { connectToDatabase } from ".";
import Lottery from "../api/db/models/lottery.model";

interface AddLotteryParams {
  address: string;
  round: number;
}

/**
 * Server action to add a lottery round for a user address
 */
export async function addLotteryRound({ address, round }: AddLotteryParams) {
  try {
    await connectToDatabase();

    // upsert ensures a new record is created if it doesn’t exist
    await Lottery.findOneAndUpdate(
      { address: address.toLowerCase() },
      { $addToSet: { lotteries: Number(round) } }, // prevents duplicates
      { upsert: true, new: true }
    );

    return { success: true };
  } catch (error: any) {
    console.error("Error adding lottery round:", error);
    return { success: false, error: error.message };
  }
}
