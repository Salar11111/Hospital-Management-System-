import mongoose from 'mongoose';
import { PRESCRIPTION_STATUS } from '../config/constants.js';

export interface PrescriptionItem {
  medicine: mongoose.Types.ObjectId;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  price: number;
  instructions?: string;
}

export interface PrescriptionFields {
  doctor: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  appointment?: mongoose.Types.ObjectId;
  status: (typeof PRESCRIPTION_STATUS)[number];
  items: PrescriptionItem[];
  notes?: string;
  dispensedAt?: Date;
  dispensedBy?: mongoose.Types.ObjectId;
}

const itemSchema = new mongoose.Schema<PrescriptionItem>(
  {
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0, default: 0 },
    instructions: { type: String },
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema<PrescriptionFields>(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    status: { type: String, enum: PRESCRIPTION_STATUS, default: 'Pending' },
    items: { type: [itemSchema], required: true, validate: [(v: PrescriptionItem[]) => v.length > 0, 'At least one item is required'] },
    notes: { type: String, trim: true },
    dispensedAt: { type: Date },
    dispensedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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

export type Prescription = mongoose.HydratedDocument<PrescriptionFields>;

export { prescriptionSchema };
export const Prescription = mongoose.model<PrescriptionFields>('Prescription', prescriptionSchema);