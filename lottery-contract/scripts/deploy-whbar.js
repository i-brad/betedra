require("dotenv").config();

const { ethers } = require("hardhat");

async function main() {
  const WHABR = await ethers.getContractFactory("WHABR");

  const whbar = await WHABR.deploy();

  console.log("Contract: ", await whbar.getAddress());
}

main();

// 0x061e26757ccebbf51ed61bcc0083706357cb9f4f