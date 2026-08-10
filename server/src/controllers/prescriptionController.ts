import type { Request, Response } from 'express';
import { Prescription } from '../models/Prescription.js';
import { Medicine } from '../models/Medicine.js';
import { Patient } from '../models/Patient.js';
import { ApiError } from '../middleware/error.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { buildPagination, parsePagination } from '../utils/paginate.js';
import { writeAuditLog } from '../utils/audit.js';
import { ROLES } from '../config/constants.js';

const POPULATE = [
  { path: 'doctor', select: 'name profile.specialization' },
  { path: 'patient', select: 'name patientId contact' },
  { path: 'dispensedBy', select: 'name' },
];

export const listPrescriptions = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { page, limit } = parsePagination(req.query);
  const filter: Record<string, unknown> = {};

  switch (user.role) {
    case ROLES.DOCTOR:
      filter.doctor = user._id;
      break;
    case ROLES.PATIENT: {
      const patient = await Patient.findOne({ user: user._id });
      if (!patient) {
        res.status(200).json({ success: true, data: [], pagination: buildPagination(0, page, limit) });
        return;
      }
      filter.patient = patient._id;
      break;
    }
    default:
      break;
  }

  if (req.query.status) filter.status = String(req.query.status);

  const [total, prescriptions] = await Promise.all([
    Prescription.countDocuments(filter),
    Prescription.find(filter)
      .populate(POPULATE)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  res.status(200).json({ success: true, data: prescriptions, pagination: buildPagination(total, page, limit) });
});

export const getPrescription = asyncHandler(async (req: Request, res: Response) => {
  const prescription = await Prescription.findById(req.params.id).populate(POPULATE);
  if (!prescription) throw new ApiError(404, 'Prescription not found');
  res.status(200).json({ success: true, data: prescription });
});

export const createPrescription = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { patient, appointment, items, notes } = req.body;

  const patientDoc = await Patient.findById(patient);
  if (!patientDoc) throw new ApiError(404, 'Patient not found');

  const itemIds = items.map((i: { medicine: string }) => i.medicine);
  const medicines = await Medicine.find({ _id: { $in: itemIds } });
  if (medicines.length !== itemIds.length) {
    throw new ApiError(400, 'One or more medicines are invalid');
  }

  const priceByMed = new Map(medicines.map((m) => [m._id.toString(), m.price]));
  const itemsWithPrice = items.map((i: { medicine: string; price?: number }) => ({
    ...i,
    price: i.price ?? priceByMed.get(String(i.medicine)) ?? 0,
  }));

  const prescription = await Prescription.create({
    doctor: user._id,
    patient,
    appointment,
    status: 'Pending',
    items: itemsWithPrice,
    notes,
  });

  await writeAuditLog({
    req,
    action: 'prescription.create',
    resource: 'prescription',
    resourceId: prescription.id,
    meta: { patient: patientDoc.patientId, itemCount: items.length },
  });

  res.status(201).json({ success: true, message: 'Prescription created', data: prescription });
});

export const dispensePrescription = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const prescription = await Prescription.findById(req.params.id);
  if (!prescription) throw new ApiError(404, 'Prescription not found');

  if (prescription.status === 'Dispensed') {
    throw new ApiError(409, 'Prescription has already been dispensed');
  }
  if (prescription.status === 'Cancelled') {
    throw new ApiError(409, 'Cancelled prescriptions cannot be dispensed');
  }

  // Pre-check: any item exceeding stock aborts before any mutation.
  for (const item of prescription.items) {
    const medicine = await Medicine.findById(item.medicine);
    if (!medicine) throw new ApiError(400, `Medicine "${item.name}" no longer exists`);
    if (medicine.stockQuantity < item.quantity) {
      throw new ApiError(
        409,
        `Insufficient stock for "${item.name}". Available: ${medicine.stockQuantity}, required: ${item.quantity}`
      );
    }
  }

  // Now atomically decrement stock and flip status.
  for (const item of prescription.items) {
    await Medicine.updateOne({ _id: item.medicine }, { $inc: { stockQuantity: -item.quantity } });
  }

  prescription.status = 'Dispensed';
  prescription.dispensedAt = new Date();
  prescription.dispensedBy = user._id;
  await prescription.save();

  await writeAuditLog({
    req,
    action: 'prescription.dispense',
    resource: 'prescription',
    resourceId: prescription.id,
  });

  res.status(200).json({ success: true, message: 'Prescription dispensed', data: prescription });
});

export const cancelPrescription = asyncHandler(async (req: Request, res: Response) => {
  const prescription = await Prescription.findById(req.params.id);
  if (!prescription) throw new ApiError(404, 'Prescription not found');
  if (prescription.status !== 'Pending') {
    throw new ApiError(409, 'Only pending prescriptions can be cancelled');
  }
  prescription.status = 'Cancelled';
  await prescription.save();
  res.status(200).json({ success: true, message: 'Prescription cancelled', data: prescription });
});