import { timingSafeEqual } from "node:crypto";
import { config } from "../config.js";
import { httpError } from "../httpError.js";

export function adminAuth(req, _res, next) {
  if (!config.adminApiKey) {
    return next(httpError(503, "ADMIN_NOT_CONFIGURED", "La clé admin n'est pas configurée."));
  }

  const provided = Buffer.from(req.get("x-admin-key") || "");
  const expected = Buffer.from(config.adminApiKey);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return next(httpError(401, "UNAUTHORIZED", "Clé admin invalide."));
  }

  return next();
}
