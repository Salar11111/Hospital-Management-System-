import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { rbac } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../config/constants.js';
import {
  getPatientRecords,
  getRecord,
  createMedicalRecord,
  updateMedicalRecord,
} from '../controllers/medicalRecordController.js';
import { createMedicalRecordSchema } from '../validators/index.js';
const router = Router();
router.use(auth);
router.get(
  '/patient/:patientId',
  rbac(ROLES.ADMIN, ROLES.DOCTOR, ROLES.PATIENT),
  getPatientRecords
);
router.post(
  '/',
  rbac(ROLES.DOCTOR, ROLES.ADMIN),
  validate(createMedicalRecordSchema),
  createMedicalRecord
);
router.get('/:id', rbac(ROLES.ADMIN, ROLES.DOCTOR), getRecord);
router.patch('/:id', rbac(ROLES.DOCTOR, ROLES.ADMIN), updateMedicalRecord);
export default router;
