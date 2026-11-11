const { ZodError } = require("zod");

const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (parsed.body !== undefined) req.body = parsed.body;
    if (parsed.query !== undefined) req.query = parsed.query;
    if (parsed.params !== undefined) req.params = parsed.params;

    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0];
      return res.status(400).json({
        message: firstIssue?.message || "Validation failed",
        errors: error.issues.map((issue) => ({
          field: issue.path.slice(1).join("."),
          message: issue.message,
        })),
      });
    }

    return res.status(400).json({ message: "Invalid request data" });
  }
};

module.exports = validate;
