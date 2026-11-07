export function validate(schema) {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error("Données invalides.");
      error.status = 400;
      error.code = "VALIDATION";
      error.details = parsed.error.issues.map((issue) => issue.message);
      return next(error);
    }
    req.body = parsed.data;
    return next();
  };
}
