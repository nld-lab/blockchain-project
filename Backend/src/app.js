import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "./config.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { generalLimit } from "./middleware/rateLimit.js";
import { adminRouter } from "./routes/admin.js";
import { electionRouter } from "./routes/election.js";
import { healthRouter } from "./routes/health.js";
import { votersRouter } from "./routes/voters.js";
import { votesRouter } from "./routes/votes.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ limit: "16kb" }));
  app.use(generalLimit);
  app.use("/api/health", healthRouter);
  app.use("/api/election", electionRouter);
  app.use("/api/voters", votersRouter);
  app.use("/api/votes", votesRouter);
  app.use("/api/admin", adminRouter);
  app.use(errorHandler);
  return app;
}
