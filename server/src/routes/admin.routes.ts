import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { rbac } from '../middleware/rbac.js';
import { ROLES } from '../config/constants.js';
import { getDashboard, getAuditLogs } from '../controllers/adminController.js';

const router = Router();

router.use(auth, rbac(ROLES.ADMIN));
router.get('/dashboard', getDashboard);
router.get('/audit-logs', getAuditLogs);

export default router;