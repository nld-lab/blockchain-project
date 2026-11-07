import { Router } from "express";
import { withChain } from "../chain/client.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { validate } from "../middleware/validate.js";
import { createElectionSchema } from "../schemas.js";

export const adminRouter = Router();

adminRouter.use(adminAuth);

adminRouter.post("/election", validate(createElectionSchema), async (req, res, next) => {
  try {
    const receipt = await withChain(async (chain) => {
      const tx = await chain.createElection(req.body.title, req.body.choices);
      return tx.wait();
    });
    res.status(201).json({ status: "created", txHash: receipt.hash });
  } catch (error) {
    next(error);
  }
});

function transition(methodName, status) {
  return async (_req, res, next) => {
    try {
      const receipt = await withChain(async (chain) => {
        const tx = await chain[methodName]();
        return tx.wait();
      });
      res.json({ status, txHash: receipt.hash });
    } catch (error) {
      next(error);
    }
  };
}

adminRouter.post("/election/open", transition("openElection", "open"));
adminRouter.post("/election/close", transition("closeElection", "closed"));
adminRouter.post("/election/publish-results", transition("publishResults", "results-published"));
