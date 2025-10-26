require("dotenv").config();

const { ethers } = require("hardhat");

async function main() {
  const BetedraLottery = await ethers.getContractFactory("BetedraLottery");

  const betedraLottery = await BetedraLottery.deploy(
    "0x061e26757ccebbf51ed61bcc0083706357cb9f4f",
    "0x6792B0f43AeD66FE4e6439e7432467Fb3A4ac0cB"
  );

  console.log("BetedraLottery Contract: ", await betedraLottery.getAddress());
}

main();

//0x476642fde96ef1a176c820f3719ae75d58da9022
