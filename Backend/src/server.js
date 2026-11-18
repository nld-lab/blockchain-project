import { createApp } from "./app.js";
import { config } from "./config.js";
import { setupDatabase } from "./db/adminStore.js";

await setupDatabase();

const app = createApp();

app.listen(config.port, () => {
  console.log(`API à l'écoute sur le port ${config.port}`);
});
