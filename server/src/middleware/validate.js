const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    res.status(400).json({ success: false, message: 'Validation failed', errors });
    return;
  }
  req.body = result.data;
  next();
};
export { validate };
