import { Router } from "express";
import { readBlocks, withProvider } from "../chain/client.js";

export const blocksRouter = Router();

blocksRouter.get("/", async (req, res, next) => {
  try {
    const requestedLimit = Number(req.query.limit);
    const limit = Number.isFinite(requestedLimit) ? requestedLimit : 40;
    const blocks = await withProvider((provider) => readBlocks(provider, limit));
    res.json(blocks);
  } catch (error) {
    next(error);
  }
});
