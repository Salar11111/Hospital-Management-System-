import mongoose from 'mongoose';
import { APPOINTMENT_STATUS } from '../config/constants.js';

export interface AppointmentFields {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  bookedBy: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  status: (typeof APPOINTMENT_STATUS)[number];
  type: string;
  reason: string;
  notes?: string;
  cancellationReason?: string;
  consultedAt?: Date;
}

const appointmentSchema = new mongoose.Schema<AppointmentFields>(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    status: { type: String, enum: APPOINTMENT_STATUS, default: 'Pending' },
    type: { type: String, default: 'Consultation' },
    reason: { type: String, required: [true, 'Reason is required'], trim: true },
    notes: { type: String, trim: true },
    cancellationReason: { type: String, trim: true },
    consultedAt: { type: Date },
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

appointmentSchema.index({ doctor: 1, date: 1, time: 1 });

export type Appointment = mongoose.HydratedDocument<AppointmentFields>;

export { appointmentSchema };
export const Appointment = mongoose.model<AppointmentFields>('Appointment', appointmentSchema);