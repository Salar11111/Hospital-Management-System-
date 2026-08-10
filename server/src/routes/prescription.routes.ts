import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { rbac } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../config/constants.js';
import {
  listPrescriptions,
  getPrescription,
  createPrescription,
  dispensePrescription,
  cancelPrescription,
} from '../controllers/prescriptionController.js';
import { createPrescriptionSchema } from '../validators/index.js';

const router = Router();

router.use(auth);
router.get('/', listPrescriptions);
router.post(
  '/',
  rbac(ROLES.DOCTOR, ROLES.ADMIN),
  validate(createPrescriptionSchema),
  createPrescription
);
router.post('/:id/dispense', rbac(ROLES.PHARMACIST, ROLES.ADMIN), dispensePrescription);
router.get('/:id', getPrescription);
router.patch('/:id/cancel', rbac(ROLES.DOCTOR, ROLES.ADMIN), cancelPrescription);

export default router;