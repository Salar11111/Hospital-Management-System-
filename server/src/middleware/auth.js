import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { COOKIE_NAMES } from '../config/constants.js';
import { ApiError } from './error.js';
const auth = async (req, _res, next) => {
  try {
    const token = req.cookies[COOKIE_NAMES.ACCESS_TOKEN];
    if (!token) {
      throw new ApiError(401, 'Not authorized, no access token');
    }
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      const isExpired = err instanceof jwt.TokenExpiredError;
      throw new ApiError(
        401,
        isExpired ? 'Session expired, please sign in again' : 'Invalid token'
      );
    }
    if (decoded.type !== 'access') {
      throw new ApiError(401, 'Invalid token type');
    }
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      throw new ApiError(401, 'Not authorized, user not found or inactive');
    }
    if (user.tokenVersion !== decoded.tokenVersion) {
      throw new ApiError(401, 'Session revoked, please sign in again');
    }
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof ApiError) {
      next(err);
    } else {
      next(new ApiError(500, 'Authentication failed', err instanceof Error ? err : void 0));
    }
  }
};
export { auth };
