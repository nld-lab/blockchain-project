require("@nomicfoundation/hardhat-ethers");

/** @type {import("hardhat/config").HardhatUserConfig} */
module.exports = {
  solidity: "0.8.24",
  paths: {
    sources: "./chain/contracts",
    cache: "./chain/cache",
    artifacts: "./chain/artifacts",
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
};
