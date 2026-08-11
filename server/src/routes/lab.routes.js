import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { rbac } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../config/constants.js';
import {
  listLabOrders,
  getLabOrder,
  createLabOrder,
  completeLabOrder,
  cancelLabOrder,
} from '../controllers/labOrderController.js';
import { createLabOrderSchema, completeLabOrderSchema } from '../validators/index.js';
const router = Router();
router.use(auth);
router.get('/', listLabOrders);
router.post('/', rbac(ROLES.DOCTOR, ROLES.ADMIN), validate(createLabOrderSchema), createLabOrder);
router.post(
  '/:id/complete',
  rbac(ROLES.LABTECH, ROLES.ADMIN),
  validate(completeLabOrderSchema),
  completeLabOrder
);
router.get('/:id', getLabOrder);
router.patch('/:id/cancel', rbac(ROLES.DOCTOR, ROLES.ADMIN), cancelLabOrder);
export default router;
