import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { rbac } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../config/constants.js';
import {
  listAppointments,
  getAppointment,
  bookAppointment,
  updateAppointmentStatus,
  cancelAppointment,
} from '../controllers/appointmentController.js';
import { bookAppointmentSchema, updateAppointmentStatusSchema } from '../validators/index.js';
const router = Router();
router.use(auth);
router.get('/', listAppointments);
router.post(
  '/',
  rbac(ROLES.PATIENT, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.ADMIN),
  validate(bookAppointmentSchema),
  bookAppointment
);
router.get('/:id', getAppointment);
router.patch(
  '/:id/status',
  rbac(ROLES.PATIENT, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.ADMIN),
  validate(updateAppointmentStatusSchema),
  updateAppointmentStatus
);
router.delete('/:id', rbac(ROLES.PATIENT, ROLES.RECEPTIONIST, ROLES.ADMIN), cancelAppointment);
export default router;
