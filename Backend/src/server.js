import { createApp } from "./app.js";
import { config } from "./config.js";
import { setupDatabase } from "./db/adminStore.js";

await setupDatabase();

const app = createApp();
const server = app.listen(config.port, () => {
  console.log(`API à l'écoute sur le port ${config.port}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Le port ${config.port} est déjà utilisé. Arrêtez le serveur précédent avec "npm run dev:stop".`,
    );
    process.exit(1);
  }
  throw error;
});

function shutdown(signal) {
  console.log(`Arrêt du serveur (${signal})`);
  server.close(() => process.exit(0));
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
