import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { rbac } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../config/constants.js';
import {
  listPatients,
  getPatient,
  updatePatient,
  getPatientHistory,
} from '../controllers/patientController.js';
import { updatePatientSchema } from '../validators/index.js';
const router = Router();
router.get(
  '/',
  auth,
  rbac(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT),
  listPatients
);
router.get('/:id/history', auth, rbac(ROLES.ADMIN, ROLES.DOCTOR, ROLES.PATIENT), getPatientHistory);
router.get(
  '/:id',
  auth,
  rbac(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT),
  getPatient
);
router.patch('/:id', auth, validate(updatePatientSchema), updatePatient);
export default router;
