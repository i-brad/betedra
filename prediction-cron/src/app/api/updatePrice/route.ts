import { ethers } from "ethers";
import { NextResponse } from "next/server";
import PythAbi from "@pythnetwork/pyth-sdk-solidity/abis/IPyth.json";

async function getLatestPrice() {
  const url =
    "https://hermes.pyth.network/v2/updates/price/latest?ids%5B%5D=0x3728e591097635310e6341af53db8b7ee42da9b3a8d918f9463ce9cca886dfbd&encoding=hex&parsed=true&ignore_invalid_price_ids=false";

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    return data?.binary?.data;
  } catch (err) {
    console.error("Error fetching price:", err);
  }
}

// GET handler - will be used by Vercel Cron
export async function GET() {
  try {
    const rpcUrl = process.env.RPC_URL || "https://testnet.hashio.io/api";
    const chainId = process.env.CHAIN_ID
      ? parseInt(process.env.CHAIN_ID, 10)
      : 296;

    const privateKey = process.env.PRIVATE_KEY as string;
    if (!privateKey || privateKey.trim() === "") {
      throw new Error("Private key is not set in environment variables.");
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl, chainId);
    const wallet = new ethers.Wallet(privateKey, provider);

    const pythContract = new ethers.Contract(
      "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729",
      PythAbi,
      wallet
    );

    let updateData = await getLatestPrice();

    if (updateData.length) {
      updateData = updateData.map((item: string) => "0x" + item);
      console.log(updateData);
      const feeAmount = await pythContract.getUpdateFee(updateData);
      const tx = await pythContract.updatePriceFeeds(updateData, {
        value: feeAmount * ethers.toBigInt(10_000_000_000),
      });

      console.log(feeAmount, tx);

      return NextResponse.json(
        {
          success: true,
          message: "HBAR/USDC price update completed",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error(`Error`, error);

    return NextResponse.json(
      {
        success: false,
        message: "execution error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 200 }
    );
  }
}

// gh pr create --base main --head dev--title "Merge to main"
