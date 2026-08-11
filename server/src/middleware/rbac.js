const rbac =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized, please sign in' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: you do not have permission to perform this action',
      });
      return;
    }
    next();
  };
export { rbac };
