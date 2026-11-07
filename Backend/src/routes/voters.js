import { Router } from "express";
import { config } from "../config.js";
import { withChain } from "../chain/client.js";
import { voterHash } from "../lib/hmac.js";
import { sensitiveLimit } from "../middleware/rateLimit.js";
import { validate } from "../middleware/validate.js";
import { identitySchema } from "../schemas.js";

export const votersRouter = Router();

votersRouter.post("/identify", sensitiveLimit, validate(identitySchema), async (req, res, next) => {
  try {
    const hash = voterHash(req.body.idNumber, req.body.fullName, config.hmacSecret);
    const status = await withChain(async (chain) => ({
      registered: await chain.registered(hash),
      hasVoted: await chain.hasVoted(hash),
    }));
    res.json(status);
  } catch (error) {
    next(error);
  }
});
