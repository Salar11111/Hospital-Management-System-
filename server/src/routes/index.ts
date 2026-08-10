import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import doctorRoutes from './doctor.routes.js';
import patientRoutes from './patient.routes.js';
import appointmentRoutes from './appointment.routes.js';
import prescriptionRoutes from './prescription.routes.js';
import labRoutes from './lab.routes.js';
import medicineRoutes from './medicine.routes.js';
import medicalRecordRoutes from './medical-record.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.get('/health', (_req, res) =>
  res.status(200).json({ success: true, message: 'MediCore API is healthy', uptime: process.uptime() })
);

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/doctors', doctorRoutes);
router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/lab-orders', labRoutes);
router.use('/medicines', medicineRoutes);
router.use('/medical-records', medicalRecordRoutes);
router.use('/admin', adminRoutes);

export default router;