import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { BLOOD_GROUPS, GENDERS, PATIENT_ID_PREFIX } from '../config/constants.js';

export interface MedicalHistoryEntry {
  condition: string;
  diagnosedDate?: Date;
  notes?: string;
}

export interface InsuranceDetails {
  provider: string;
  policyNumber: string;
  expiryDate?: Date;
}

export interface PatientFields {
  user: mongoose.Types.ObjectId;
  patientId: string;
  name: string;
  dob?: Date;
  gender: (typeof GENDERS)[number];
  bloodGroup: (typeof BLOOD_GROUPS)[number];
  contact: {
    phone?: string;
    email?: string;
    address?: string;
    emergencyContact?: string;
  };
  medicalHistory: MedicalHistoryEntry[];
  allergies: string[];
  insurance?: InsuranceDetails;
}

const patientSchema = new mongoose.Schema<PatientFields>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    patientId: {
      type: String,
      unique: true,
      required: [true, 'Patient ID is required'],
    },
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 80 },
    dob: { type: Date },
    gender: { type: String, enum: GENDERS, default: 'Prefer not to say' },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, default: 'Unknown' },
    contact: {
      phone: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      address: { type: String, trim: true },
      emergencyContact: { type: String, trim: true },
    },
    medicalHistory: {
      type: [
        {
          condition: { type: String, required: true },
          diagnosedDate: { type: Date },
          notes: { type: String },
        },
      ],
      default: [],
    },
    allergies: { type: [String], default: [] },
    insurance: {
      provider: { type: String },
      policyNumber: { type: String },
      expiryDate: { type: Date },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

patientSchema.pre('validate', function () {
  if (!this.patientId) {
    this.patientId = `${PATIENT_ID_PREFIX}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  }
});

export type Patient = mongoose.HydratedDocument<PatientFields>;

export { patientSchema };
export const Patient = mongoose.model<PatientFields>('Patient', patientSchema);