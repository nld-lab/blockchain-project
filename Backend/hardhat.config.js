import hardhatEthers from "@nomicfoundation/hardhat-ethers";

/** @type {import("hardhat/config").HardhatUserConfig} */
export default {
  plugins: [hardhatEthers],
  solidity: "0.8.24",
  paths: {
    sources: "./chain/contracts",
    cache: "./chain/cache",
    artifacts: "./chain/artifacts",
  },
  networks: {
    localhost: {
      type: "http",
      url: process.env.HARDHAT_RPC_URL || "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
};
