import mongoose from 'mongoose';
import { LAB_ORDER_STATUS } from '../config/constants.js';

export interface LabResult {
  parameter: string;
  value: string;
  unit?: string;
  referenceRange?: string;
}

export interface LabOrderFields {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  appointment?: mongoose.Types.ObjectId;
  testName: string;
  status: (typeof LAB_ORDER_STATUS)[number];
  results: LabResult[];
  notes?: string;
  completedAt?: Date;
  completedBy?: mongoose.Types.ObjectId;
}

const resultSchema = new mongoose.Schema<LabResult>(
  {
    parameter: { type: String, required: true },
    value: { type: String, required: true },
    unit: { type: String },
    referenceRange: { type: String },
  },
  { _id: false }
);

const labOrderSchema = new mongoose.Schema<LabOrderFields>(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    testName: { type: String, required: [true, 'Test name is required'], trim: true },
    status: { type: String, enum: LAB_ORDER_STATUS, default: 'Pending' },
    results: { type: [resultSchema], default: [] },
    notes: { type: String, trim: true },
    completedAt: { type: Date },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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

export type LabOrder = mongoose.HydratedDocument<LabOrderFields>;

export { labOrderSchema };
export const LabOrder = mongoose.model<LabOrderFields>('LabOrder', labOrderSchema);