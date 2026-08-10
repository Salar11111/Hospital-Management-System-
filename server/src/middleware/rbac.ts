import type { NextFunction, Request, Response } from 'express';
import type { Role } from '../config/constants.js';

export const rbac =
  (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
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