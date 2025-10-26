require("dotenv").config();

const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const adminAddress = await deployer.getAddress();
  const pyth = "0xa2aa501b19aff244d90cc15a4cf739d2725b5729";
  const hbarUsdfeedId =
    "0x3728e591097635310e6341af53db8b7ee42da9b3a8d918f9463ce9cca886dfbd";
  const BetedraPrediction = await ethers.getContractFactory(
    "BetedraPrediction"
  );

  const predictionContract = await BetedraPrediction.deploy(
    pyth, //_oracleAddress
    hbarUsdfeedId,
    adminAddress, // _adminAddress
    adminAddress, // _operatorAddress
    300, // _intervalSeconds (300sec ~ 5 mins)
    60, //_bufferSeconds
    ethers.parseUnits("2", 8), // _minBetAmount 5 HBAR using 8 decimals unit
    300, //_oracleUpdateAllowance in seconds
    300 //_treasuryFee
  );
  await predictionContract.waitForDeployment();

  const predictionAddress = await predictionContract.getAddress();


  //Get price
  // const predictionContract = await ethers.getContractAt(
  //   "BetedraPrediction",
  //   "0xfB288183610Eb495e26A855F0A8fb7cDF4d96B77"
  // );

  const price = await predictionContract.getPriceFromOracle();

  console.log("Response: ", price);

  console.log("Prediction Contract Address deployed to: ", predictionAddress);
}

main();

//npx hardhat run scripts/deploy-prediction.js --network hedera-testnet

// npx hardhat verify  _oracleAddress hbarUsdfeedId _adminAddress _operatorAddress  300 30 2e8 300 300 --network hedera-testnet
