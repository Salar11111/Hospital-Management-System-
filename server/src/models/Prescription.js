import mongoose from 'mongoose';
import { PRESCRIPTION_STATUS } from '../config/constants.js';
const itemSchema = new mongoose.Schema(
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
const prescriptionSchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    status: { type: String, enum: PRESCRIPTION_STATUS, default: 'Pending' },
    items: {
      type: [itemSchema],
      required: true,
      validate: [(v) => v.length > 0, 'At least one item is required'],
    },
    notes: { type: String, trim: true },
    dispensedAt: { type: Date },
    dispensedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);
const Prescription = mongoose.model('Prescription', prescriptionSchema);
export { Prescription, prescriptionSchema };
