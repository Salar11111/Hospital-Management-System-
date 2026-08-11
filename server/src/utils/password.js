import { AUTH } from '../config/constants.js';
import { ApiError } from '../middleware/error.js';
const checkAccountLock = (user) => {
  if (user.isLocked()) {
    const lockedUntil = user.lockedUntil ?? /* @__PURE__ */ new Date();
    const remainingMs = lockedUntil.getTime() - Date.now();
    const remainingMin = Math.max(1, Math.ceil(remainingMs / 6e4));
    throw new ApiError(423, `Account locked. Try again in ~${remainingMin} minute(s).`);
  }
  if (user.failedLoginAttempts >= AUTH.MAX_FAILED_ATTEMPTS) {
    throw new ApiError(
      423,
      `Account locked after ${AUTH.MAX_FAILED_ATTEMPTS} failed attempts. Try again in 15 minutes.`
    );
  }
};
const recordFailedLogin = async (user) => {
  user.failedLoginAttempts += 1;
  if (user.failedLoginAttempts >= AUTH.MAX_FAILED_ATTEMPTS) {
    user.lockedUntil = new Date(Date.now() + AUTH.LOCKOUT_MS);
  }
  await user.save();
};
const resetLoginFailures = async (user) => {
  if (user.failedLoginAttempts > 0 || user.lockedUntil) {
    user.failedLoginAttempts = 0;
    user.lockedUntil = void 0;
    await user.save();
  }
};
export { checkAccountLock, recordFailedLogin, resetLoginFailures };
