import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { rbac } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../config/constants.js';
import {
  listUsers,
  createStaff,
  updateStaffStatus,
  deleteUser,
} from '../controllers/userController.js';
import { staffCreateSchema, updateStatusSchema } from '../validators/index.js';
const router = Router();
router.use(auth, rbac(ROLES.ADMIN));
router.get('/', listUsers);
router.post('/', validate(staffCreateSchema), createStaff);
router.patch('/:id/status', validate(updateStatusSchema), updateStaffStatus);
router.delete('/:id', deleteUser);
export default router;
