import rateLimit from "express-rate-limit";

function limit(max) {
  return rateLimit({
    windowMs: 60_000,
    limit: max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: "RATE_LIMIT",
      message: "Trop de tentatives. Réessayez dans une minute.",
    },
  });
}

export const generalLimit = limit(60);
export const sensitiveLimit = limit(10);
