import { Router } from "express";
import { config } from "../config.js";
import { withChain } from "../chain/client.js";
import { authenticateAdmin, deleteAdminSession } from "../db/adminStore.js";
import { httpError } from "../httpError.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { sensitiveLimit } from "../middleware/rateLimit.js";
import { validate } from "../middleware/validate.js";
import { adminLoginSchema, createElectionSchema } from "../schemas.js";

export const adminRouter = Router();

adminRouter.post("/login", sensitiveLimit, validate(adminLoginSchema), async (req, res, next) => {
  try {
    if (!config.databaseUrl) {
      throw httpError(503, "DATABASE_UNAVAILABLE", "La base d'authentification n'est pas configurée.");
    }
    const session = await authenticateAdmin(req.body.username, req.body.password);
    if (!session) {
      throw httpError(401, "UNAUTHORIZED", "Identifiants invalides.");
    }
    res.json(session);
  } catch (error) {
    next(error);
  }
});

adminRouter.post("/logout", adminAuth, async (req, res, next) => {
  try {
    const header = req.get("authorization") || "";
    const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";
    await deleteAdminSession(token);
    res.json({ status: "logged-out" });
  } catch (error) {
    next(error);
  }
});

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
