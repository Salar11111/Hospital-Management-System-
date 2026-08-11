import mongoose from 'mongoose';
const medicalRecordSchema = new mongoose.Schema(
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
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);
const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
export { MedicalRecord, medicalRecordSchema };
