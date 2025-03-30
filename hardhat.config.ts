require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

const SEPOLIA_URL = process.env.SEPOLIA_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const config = {
  solidity: "0.8.19",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337
    },
    sepolia: {
      url: SEPOLIA_URL || "https://rpc.sepolia.org",
      accounts: PRIVATE_KEY ? [`0x${PRIVATE_KEY}`] : [],
      chainId: 11155111,
      gas: 2100000,
      gasPrice: 8000000000 // 8 gwei
    }
  },
  paths: {
    artifacts: "./artifacts",
    sources: "./contracts",
    cache: "./cache",
    tests: "./test"
  },
};

module.exports = config; 