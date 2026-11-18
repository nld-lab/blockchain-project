import "dotenv/config";

export const config = {
  port: Number(process.env.PORT || 3000),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  hmacSecret: process.env.HMAC_SECRET || "",
  databaseUrl: process.env.DATABASE_URL || "",
  adminUsername: process.env.ADMIN_USERNAME || "admin",
  adminPassword: process.env.ADMIN_PASSWORD || "",
  rpcUrl: process.env.RPC_URL || "http://127.0.0.1:8545",
  contractAddress: process.env.CONTRACT_ADDRESS || "",
  relayerPrivateKey: process.env.RELAYER_PRIVATE_KEY || "",
  chainId: Number(process.env.CHAIN_ID || 31337),
};
