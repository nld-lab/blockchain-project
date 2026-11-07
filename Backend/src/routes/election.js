import { Router } from "express";
import { readElection, readJournal, withChain } from "../chain/client.js";

export const electionRouter = Router();

electionRouter.get("/", async (_req, res, next) => {
  try {
    const election = await withChain((chain) => readElection(chain));
    res.json(election);
  } catch (error) {
    next(error);
  }
});

electionRouter.get("/transactions", async (_req, res, next) => {
  try {
    const transactions = await withChain((chain) => readJournal(chain));
    res.json({ transactions });
  } catch (error) {
    next(error);
  }
});
