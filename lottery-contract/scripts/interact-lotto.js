require("dotenv").config();

const { ethers } = require("hardhat");

async function main() {
  const contract = await ethers.getContractAt(
    "BetedraLottery",
    "0xA39Bb3C13f15e685EA6a31154d1852558acD530D"
  );
  const [deployer] = await ethers.getSigners();
  const operatorAddress = await deployer.getAddress();
  const provider = ethers.provider;
  const block = await provider.getBlock("latest");
  const endTime = Number(block.timestamp) + 24 * 60 * 60; //24 hours
  const priceTicketInHbar = 5e8; //10 HBAR, should be equivalent of a dollar value we choose
  const discountDivisor = 990;
  const rewardsBreakdown = [250, 375, 625, 1250, 2500, 5000];
  const treasuryFee = 2000;

  console.log("endTime: ", endTime);

  // await contract.setOperatorAndTreasuryAndInjectorAddresses(
  //   operatorAddress,
  //   operatorAddress,
  //   operatorAddress
  // );

  // const res = await contract.startLottery(
  //   endTime,
  //   priceTicketInHbar,
  //   discountDivisor,
  //   rewardsBreakdown,
  //   treasuryFee
  // );

  const lotteryId = await contract.currentLotteryId();

  console.log(lotteryId);

  const ticketNumbers = [1000004];

  const res = await contract.buyTickets(lotteryId, ticketNumbers, {
    value: ethers.parseUnits("5", 18),
  });

  console.log("Response: ", res);
}

main();
