import mongoose from 'mongoose';
import { LAB_ORDER_STATUS } from '../config/constants.js';
const resultSchema = new mongoose.Schema(
  {
    parameter: { type: String, required: true },
    value: { type: String, required: true },
    unit: { type: String },
    referenceRange: { type: String },
  },
  { _id: false }
);
const labOrderSchema = new mongoose.Schema(
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
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);
const LabOrder = mongoose.model('LabOrder', labOrderSchema);
export { LabOrder, labOrderSchema };
