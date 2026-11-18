import { config } from "../config.js";
import { findAdminSession } from "../db/adminStore.js";
import { httpError } from "../httpError.js";

export async function adminAuth(req, _res, next) {
  try {
    if (!config.databaseUrl) {
      return next(httpError(503, "DATABASE_UNAVAILABLE", "La base d'authentification n'est pas configurée."));
    }

    const header = req.get("authorization") || "";
    const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";
    const session = await findAdminSession(token);
    if (!session) {
      return next(httpError(401, "UNAUTHORIZED", "Connexion administrateur requise."));
    }

    req.admin = session;
    return next();
  } catch (error) {
    return next(error);
  }
}
