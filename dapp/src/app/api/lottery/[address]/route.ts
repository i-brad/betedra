import { NextResponse } from "next/server";
import { connectToDatabase } from "../../db";
import Lottery from "../../db/models/lottery.model";

// GET /api/lottery/:address
export async function GET(
  req: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    await connectToDatabase();

    const { address } = await params;

    const lottery = await Lottery.findOne({ address: address.toLowerCase() });

    if (!lottery) {
      return NextResponse.json(
        { success: false, message: "Lottery data not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: lottery?.lotteries || [],
    });
  } catch (error: any) {
    console.error("Error fetching lottery data:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
