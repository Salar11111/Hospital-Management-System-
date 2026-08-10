import mongoose from 'mongoose';

export interface Vitals {
  bp?: string;
  temperature?: string;
  pulse?: number;
  weight?: number;
  height?: number;
}

export interface MedicalRecordFields {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  appointment?: mongoose.Types.ObjectId;
  diagnosis: string;
  symptoms: string;
  vitals?: Vitals;
  notes?: string;
}

const medicalRecordSchema = new mongoose.Schema<MedicalRecordFields>(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    diagnosis: { type: String, required: [true, 'Diagnosis is required'], trim: true },
    symptoms: { type: String, required: [true, 'Symptoms are required'], trim: true },
    vitals: {
      bp: { type: String },
      temperature: { type: String },
      pulse: { type: Number },
      weight: { type: Number },
      height: { type: Number },
    },
    notes: { type: String, trim: true },
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

export type MedicalRecord = mongoose.HydratedDocument<MedicalRecordFields>;

export { medicalRecordSchema };
export const MedicalRecord = mongoose.model<MedicalRecordFields>('MedicalRecord', medicalRecordSchema);