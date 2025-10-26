require("dotenv").config();

const { ethers } = require("hardhat");

async function main() {
  const contract = await ethers.getContractAt(
    "PrngSystemContract",
    "0x6792B0f43AeD66FE4e6439e7432467Fb3A4ac0cB"
  );

  await contract.getPseudorandomNumber(1000000, 1999999);

  const rand = await contract.getNumber();

  console.log("Response: ", rand);
}

main();
