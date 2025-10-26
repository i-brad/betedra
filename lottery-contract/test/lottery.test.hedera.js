const { expect, assert, should } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("BetedraLottery", function () {
  before(async function () {
    const [deployer] = await ethers.getSigners();

    // const WHABR = await ethers.getContractFactory("WHABR");
    // const whbar = await WHABR.deploy();
    // await whbar.waitForDeployment();

    // this.whbar = whbar;

    // const PrngSystemContract = await ethers.getContractFactory(
    //   "PrngSystemContract"
    // );
    // const prng = await PrngSystemContract.deploy();
    // await prng.waitForDeployment();

    const BetedraLottery = await ethers.getContractFactory("BetedraLottery");

    const lotto = await BetedraLottery.deploy(
      "0x827Ce605Cb1099dF1F263566087df56feCe22E93",
      "0x64b50285F4f7465608482D68618CD9643FCa22C2"
      //   await whbar.getAddress(),
      //   await prng.getAddress()
    );

    await lotto.waitForDeployment();

    console.log(await lotto.getAddress());

    this.lotto = lotto;
    this.deployerAddress = await deployer.getAddress();
  });

  describe("Token", function () {
    it("Should start lotto & buy raffle tickets", async function () {
      const provider = ethers.provider;
      const block = await provider.getBlock("latest");
      const endTime = Number(block.timestamp) + 24 * 60 * 60; //24 hours
      const priceTicketInHbar = 5e8; //10 HBAR, should be equivalent of a dollar value we choose
      const discountDivisor = 990;
      const rewardsBreakdown = [250, 375, 625, 1250, 2500, 5000];
      const treasuryFee = 2000;
      const contract = this.lotto;
      const operatorAddress = this.deployerAddress;

      await contract.setOperatorAndTreasuryAndInjectorAddresses(
        operatorAddress,
        operatorAddress,
        operatorAddress
      );

      await contract.startLottery(
        endTime,
        priceTicketInHbar,
        discountDivisor,
        rewardsBreakdown,
        treasuryFee
      );

      const lotteryId = await contract.currentLotteryId();
      const ticketNumbers = [1000004];

      await contract.buyTickets(lotteryId, ticketNumbers, {
        value: 100e8,
      });

      //At Round end
      //   await time.increase(13 * 60 * 60); //2 days

      //   await contract.closeLottery(lotteryId); //Admin calls
      //   await contract.drawFinalNumberAndMakeLotteryClaimable(lotteryId, true); //Admin calls

      //   const luckyResult = await contract.randomResult();

      //   console.log(luckyResult);

      //   const [ticketIds, _ticketNumbers] =
      //     await contract.viewUserInfoForLotteryId(
      //       operatorAddress,
      //       lotteryId,
      //       0,
      //       6
      //     );

      //   console.log(ticketIds, _ticketNumbers);

      //One after the other
      //   await contract.claimTickets(lotteryId, [0], [5]); //Match all 6
      //   await contract.claimTickets(lotteryId, [1], [4]); //Match first 5
      //   await contract.claimTickets(lotteryId, [2], [3]); //Match first 4
      //   await contract.claimTickets(lotteryId, [3], [2]); //Match first 3
      //   await contract.claimTickets(lotteryId, [4], [1]); //Match first 2
      //   await contract.claimTickets(lotteryId, [5], [0]); //Match first 1

      //OR
      //At once
      //   await contract.claimTickets(
      //     lotteryId,
      //     [0, 1, 2, 3, 4, 5],
      //     [5, 4, 3, 2, 1, 0]
      //   );
    });
  });
});

//For testing: npx hardhat test test/lottery.test.js --network hedera-testnet
