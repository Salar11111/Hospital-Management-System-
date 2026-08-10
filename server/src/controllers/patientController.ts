import type { Request, Response } from 'express';
import { Patient } from '../models/Patient.js';
import { MedicalRecord } from '../models/MedicalRecord.js';
import { buildPagination, parsePagination } from '../utils/paginate.js';
import { ApiError } from '../middleware/error.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { ROLES } from '../config/constants.js';

export const listPatients = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = parsePagination(req.query);

  const filter: Record<string, unknown> = {};
  if (req.query.search) {
    const search = String(req.query.search);
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { patientId: { $regex: search, $options: 'i' } },
      { 'contact.email': { $regex: search, $options: 'i' } },
      { 'contact.phone': { $regex: search, $options: 'i' } },
    ];
  }

  const user = req.user!;
  // Patients only see themselves, doctors see their assigned patients handled by doctor routes.
  if (user.role === ROLES.PATIENT) {
    const own = await Patient.findOne({ user: user._id });
    if (!own) {
      res.status(200).json({ success: true, data: [], pagination: buildPagination(0, page, limit) });
      return;
    }
    filter._id = own._id;
  }

  const [total, patients] = await Promise.all([
    Patient.countDocuments(filter),
    Patient.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
  ]);

  res.status(200).json({ success: true, data: patients, pagination: buildPagination(total, page, limit) });
});

export const getPatient = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const patient = await Patient.findById(req.params.id);
  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  if (user.role === ROLES.PATIENT && patient.user.toString() !== user._id.toString()) {
    throw new ApiError(403, 'You can only view your own patient record');
  }

  res.status(200).json({ success: true, data: patient });
});

export const updatePatient = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const patient = await Patient.findById(req.params.id);
  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  if (user.role === ROLES.PATIENT && patient.user.toString() !== user._id.toString()) {
    throw new ApiError(403, 'You can only edit your own patient record');
  }

  const allowed = ['dob', 'gender', 'bloodGroup', 'contact', 'allergies', 'insurance'];
  const updates: Record<string, unknown> = {};
  for (const field of allowed) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  patient.set(updates);
  await patient.save();
  res.status(200).json({ success: true, message: 'Patient updated', data: patient });
});

export const getPatientHistory = asyncHandler(async (req: Request, res: Response) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  const user = req.user!;
  if (user.role === ROLES.PATIENT && patient.user.toString() !== user._id.toString()) {
    throw new ApiError(403, 'You can only view your own records');
  }

  const [records, labOrders, prescriptions] = await Promise.all([
    MedicalRecord.find({ patient: patient._id }).populate('doctor', 'name').sort({ createdAt: -1 }),
    import('../models/LabOrder.js').then(({ LabOrder }) =>
      LabOrder.find({ patient: patient._id }).populate('doctor', 'name').sort({ createdAt: -1 })
    ),
    import('../models/Prescription.js').then(({ Prescription }) =>
      Prescription.find({ patient: patient._id }).populate('doctor', 'name').sort({ createdAt: -1 })
    ),
  ]);

  res.status(200).json({
    success: true,
    data: { patient, medicalRecords: records, labOrders, prescriptions },
  });
});