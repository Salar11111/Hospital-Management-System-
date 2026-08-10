import { z } from 'zod';
import { APPOINTMENT_STATUS } from '../config/constants.js';

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid resource id');

const objectId = (msg = 'Invalid reference id') => z.string().regex(/^[a-f\d]{24}$/i, msg);

export const bookAppointmentSchema = z.object({
  patient: objectId(),
  doctor: objectId(),
  date: z.string().min(1, 'Date is required'),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:mm format'),
  reason: z.string().min(3, 'Reason must be at least 3 characters').max(300),
  notes: z.string().max(500).optional(),
  type: z.string().max(50).optional(),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(APPOINTMENT_STATUS),
  cancellationReason: z.string().max(300).optional(),
});

export const createMedicalRecordSchema = z.object({
  patient: objectId(),
  appointment: objectId().optional(),
  diagnosis: z.string().min(2).max(1000),
  symptoms: z.string().min(2).max(1000),
  vitals: z
    .object({
      bp: z.string().max(20).optional(),
      temperature: z.string().max(20).optional(),
      pulse: z.number().nonnegative().optional(),
      weight: z.number().nonnegative().optional(),
      height: z.number().nonnegative().optional(),
    })
    .optional(),
  notes: z.string().max(1000).optional(),
});

export const createPrescriptionSchema = z.object({
  patient: objectId(),
  appointment: objectId().optional(),
  items: z
    .array(
      z.object({
        medicine: objectId(),
        dosage: z.string().max(50),
        frequency: z.string().max(80),
        duration: z.string().max(50),
        quantity: z.number().int().positive(),
        instructions: z.string().max(300).optional(),
      })
    )
    .min(1, 'At least one medicine is required'),
  notes: z.string().max(500).optional(),
});

export const createLabOrderSchema = z.object({
  patient: objectId(),
  appointment: objectId().optional(),
  testName: z.string().min(2).max(100),
  notes: z.string().max(500).optional(),
});

export const completeLabOrderSchema = z.object({
  results: z
    .array(
      z.object({
        parameter: z.string().min(1).max(100),
        value: z.string().min(1).max(200),
        unit: z.string().max(30).optional(),
        referenceRange: z.string().max(100).optional(),
      })
    )
    .min(1, 'At least one result is required'),
});

export const createPatientSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().optional(),
  password: z.string().min(6).max(100),
  phone: z.string().max(30).optional(),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']).optional(),
  dob: z.coerce.date().optional(),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']).optional(),
  address: z.string().max(300).optional(),
  emergencyContact: z.string().max(100).optional(),
});

export const updatePatientSchema = z.object({
  dob: z.coerce.date().optional(),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']).optional(),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']).optional(),
  contact: z
    .object({
      phone: z.string().max(30).optional(),
      email: z.string().email().optional(),
      address: z.string().max(300).optional(),
      emergencyContact: z.string().max(100).optional(),
    })
    .optional(),
  allergies: z.array(z.string().max(100)).optional(),
  insurance: z
    .object({
      provider: z.string().max(100).optional(),
      policyNumber: z.string().max(100).optional(),
      expiryDate: z.coerce.date().optional(),
    })
    .optional(),
});

export const createMedicineSchema = z.object({
  name: z.string().min(2).max(100),
  genericName: z.string().max(100).optional(),
  category: z.string().max(50).optional(),
  stockQuantity: z.number().nonnegative().optional(),
  price: z.number().nonnegative(),
  expiryDate: z.coerce.date().optional(),
  supplier: z.string().max(100).optional(),
  reorderLevel: z.number().nonnegative().optional(),
});

export const updateMedicineSchema = createMedicineSchema.partial().omit({ name: true });

export const staffCreateSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  role: z.enum(['Nurse', 'Receptionist', 'Pharmacist', 'LabTech']),
  phone: z.string().max(30).optional(),
  department: z.string().max(80).optional(),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']).optional(),
});

export const updateStatusSchema = z.object({
  isActive: z.boolean(),
});

export const scheduleSchema = z.object({
  schedule: z.array(
    z.object({
      day: z.string().min(1).max(20),
      startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid start time'),
      endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid end time'),
      isAvailable: z.boolean().optional(),
    })
  ),
});