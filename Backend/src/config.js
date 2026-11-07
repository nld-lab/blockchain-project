import "dotenv/config";

export const config = {
  port: Number(process.env.PORT || 3000),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5500",
  hmacSecret: process.env.HMAC_SECRET || "",
  adminApiKey: process.env.ADMIN_API_KEY || "",
  rpcUrl: process.env.RPC_URL || "http://127.0.0.1:8545",
  contractAddress: process.env.CONTRACT_ADDRESS || "",
  relayerPrivateKey: process.env.RELAYER_PRIVATE_KEY || "",
  chainId: Number(process.env.CHAIN_ID || 31337),
};
