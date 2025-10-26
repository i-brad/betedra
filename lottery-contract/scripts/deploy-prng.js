require("dotenv").config();

const { ethers } = require("hardhat");

async function main() {
  const PrngSystemContract = await ethers.getContractFactory(
    "PrngSystemContract"
  );

  const prngSysContract = await PrngSystemContract.deploy();

  console.log("Contract: ", await prngSysContract.getAddress());
}

main();

// 0x6792B0f43AeD66FE4e6439e7432467Fb3A4ac0cB