import { Router } from "express";
import { config } from "../config.js";
import { submitVote, withChain } from "../chain/client.js";
import { voterHash } from "../lib/hmac.js";
import { sensitiveLimit } from "../middleware/rateLimit.js";
import { validate } from "../middleware/validate.js";
import { voteSchema } from "../schemas.js";

export const votesRouter = Router();

votesRouter.post("/", sensitiveLimit, validate(voteSchema), async (req, res, next) => {
  try {
    const hash = voterHash(req.body.idNumber, req.body.fullName, config.hmacSecret);
    const result = await withChain((chain) => submitVote(chain, hash, req.body.choiceId));
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});
