import hardhatEthers from "@nomicfoundation/hardhat-ethers";

/** @type {import("hardhat/config").HardhatUserConfig} */
export default {
  plugins: [hardhatEthers],
  solidity: {
    version: "0.8.24",
    settings: { evmVersion: "london" },
  },
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
      accounts: [
        process.env.RELAYER_PRIVATE_KEY ||
          "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
      ],
    },
  },
};
