import { type NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../db";
import leaderboard from "../db/models/leaderboard";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Get leaderboard sorted by total_rounds_played in descending order
    const response = await leaderboard
      .find({ total_rounds_played: { $gt: 0 } })
      .sort({
        total_rounds_played: -1,
      });

    // Find the rank for the specific address
    const position = response.findIndex(
      (user: any) => user.address?.toLowerCase() === address?.toLowerCase()
    );

    if (position === -1) {
      return NextResponse.json(
        { error: "No records found for this address" },
        { status: 204 }
      );
    }

    return NextResponse.json(
      {
        rank: position + 1, // The rank is 1-based, so we add 1
        data: response[position],
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error occurred: " + error?.message || "" },
      { status: 500 }
    );
  }
}
