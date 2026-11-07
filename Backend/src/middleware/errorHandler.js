import { ZodError } from "zod";

export function errorHandler(error, _req, res, _next) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: "VALIDATION",
      message: "Données invalides.",
      details: error.issues.map((issue) => issue.message),
    });
  }

  const status = error.status || 500;
  if (status >= 500 && !error.status) {
    console.error("Erreur interne");
  }

  return res.status(status).json({
    error: error.code || "INTERNAL",
    message: status === 500 && !error.status ? "Erreur interne." : error.message,
    ...(error.details ? { details: error.details } : {}),
  });
}
