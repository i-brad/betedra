require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // Focus only on Oracle contracts and exclude v3-core and other problematic contracts
  paths: {
    sources: "./contracts",
  },
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    "hedera-testnet": {
      url: `https://testnet.hashio.io/api`,
      accounts: [process.env.PRIVATE_KEY],
    },
    "hedera-mainnet": {
      url: "https://mainnet.hashio.io/api",
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 1000000000,
      gas: 80000000,
    },
  },
  etherscan: {
    apiKey: {
      "hedera-testnet": "your-etherscan-api-key",
      "hedera-mainnet": "your-etherscan-api-key",
    },
    customChains: [
      {
        network: "hedera-testnet",
        chainId: 296,
        urls: {
          apiURL: "",
          browserURL: "",
        },
        accounts: [process.env.PRIVATE_KEY],
      },
      {
        network: "hedera-mainnet",
        chainId: 295,
        urls: {
          apiURL: "",
          browserURL: "",
        },
        accounts: [process.env.PRIVATE_KEY],
      },
    ],
  },
};
