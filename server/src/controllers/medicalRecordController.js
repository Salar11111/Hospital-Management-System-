import { MedicalRecord } from '../models/MedicalRecord.js';
import { Appointment } from '../models/Appointment.js';
import { Patient } from '../models/Patient.js';
import { ApiError } from '../middleware/error.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { buildPagination, parsePagination } from '../utils/paginate.js';
import { ROLES } from '../config/constants.js';
const getPatientRecords = asyncHandler(async (req, res) => {
  const user = req.user;
  const patient = await Patient.findById(req.params.patientId);
  if (!patient) throw new ApiError(404, 'Patient not found');
  if (user.role === ROLES.PATIENT && patient.user.toString() !== user._id.toString()) {
    throw new ApiError(403, 'You can only view your own medical records');
  }
  const { page, limit } = parsePagination(req.query);
  const filter = { patient: patient._id };
  if (user.role === ROLES.DOCTOR) filter.doctor = user._id;
  const [total, records] = await Promise.all([
    MedicalRecord.countDocuments(filter),
    MedicalRecord.find(filter)
      .populate('doctor', 'name profile.specialization')
      .populate('appointment', 'date time')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);
  res
    .status(200)
    .json({ success: true, data: records, pagination: buildPagination(total, page, limit) });
});
const getRecord = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.findById(req.params.id)
    .populate('doctor', 'name profile.specialization')
    .populate('patient', 'name patientId')
    .populate('appointment', 'date time');
  if (!record) throw new ApiError(404, 'Medical record not found');
  res.status(200).json({ success: true, data: record });
});
const createMedicalRecord = asyncHandler(async (req, res) => {
  const user = req.user;
  const { patient, appointment, diagnosis, symptoms, vitals, notes } = req.body;
  const patientDoc = await Patient.findById(patient);
  if (!patientDoc) throw new ApiError(404, 'Patient not found');
  if (appointment) {
    const appt = await Appointment.findById(appointment);
    if (!appt) throw new ApiError(404, 'Appointment not found');
    if (appt.doctor.toString() !== user._id.toString()) {
      throw new ApiError(403, 'You can only add records to your own appointments');
    }
  }
  const record = await MedicalRecord.create({
    patient,
    doctor: user._id,
    appointment,
    diagnosis,
    symptoms,
    vitals,
    notes,
  });
  res.status(201).json({ success: true, message: 'Medical record created', data: record });
});
const updateMedicalRecord = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.findById(req.params.id);
  if (!record) throw new ApiError(404, 'Medical record not found');
  const allowed = ['diagnosis', 'symptoms', 'vitals', 'notes'];
  const updates = {};
  for (const field of allowed) {
    if (req.body[field] !== void 0) updates[field] = req.body[field];
  }
  record.set(updates);
  await record.save();
  res.status(200).json({ success: true, message: 'Medical record updated', data: record });
});
export { createMedicalRecord, getPatientRecords, getRecord, updateMedicalRecord };
