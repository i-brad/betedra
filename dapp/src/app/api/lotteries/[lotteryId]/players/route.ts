import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../db";
import Lottery from "../../../db/models/lottery.model";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ lotteryId: string }> }
) {
  try {
    await connectToDatabase();
    const { lotteryId: stringLotteryId } = await params;
    const lotteryId = Number(stringLotteryId);

    if (isNaN(lotteryId)) {
      return NextResponse.json({ error: "Invalid lotteryId" }, { status: 400 });
    }

    // Count how many players (documents) contain this lotteryId in their lotteries array
    const totalPlayers = await Lottery.countDocuments({
      lotteries: { $in: [lotteryId] },
    });

    return NextResponse.json({ lotteryId, totalPlayers });
  } catch (error) {
    console.error("Error fetching total players:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    // optional: disconnect if you want to close after each request
    // await mongoose.disconnect();
  }
}
