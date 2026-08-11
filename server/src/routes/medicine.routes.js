import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { rbac } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../config/constants.js';
import {
  listMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from '../controllers/medicineController.js';
import { createMedicineSchema, updateMedicineSchema } from '../validators/index.js';
const router = Router();
router.get('/', listMedicines);
router.get('/:id', getMedicine);
router.post(
  '/',
  auth,
  rbac(ROLES.ADMIN, ROLES.PHARMACIST),
  validate(createMedicineSchema),
  createMedicine
);
router.patch(
  '/:id',
  auth,
  rbac(ROLES.ADMIN, ROLES.PHARMACIST),
  validate(updateMedicineSchema),
  updateMedicine
);
router.delete('/:id', auth, rbac(ROLES.ADMIN), deleteMedicine);
export default router;
