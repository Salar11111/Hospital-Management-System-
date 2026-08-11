import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { rbac } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../config/constants.js';
import {
  listDoctors,
  getDoctor,
  getDoctorSchedule,
  updateDoctorSchedule,
  getServices,
} from '../controllers/doctorController.js';
import { scheduleSchema } from '../validators/index.js';
const router = Router();
router.get('/', listDoctors);
router.get('/services', getServices);
router.get('/:id/schedule', auth, getDoctorSchedule);
router.put(
  '/:id/schedule',
  auth,
  rbac(ROLES.DOCTOR, ROLES.ADMIN),
  validate(scheduleSchema),
  updateDoctorSchedule
);
router.get('/:id', getDoctor);
export default router;
