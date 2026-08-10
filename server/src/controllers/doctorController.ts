import type { Request, Response } from 'express';
import { User } from '../models/User.js';
import { ApiError } from '../middleware/error.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { buildPagination, parsePagination } from '../utils/paginate.js';
import { PUBLIC_USER_FIELDS, ROLES } from '../config/constants.js';

export const listDoctors = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = parsePagination(req.query);
  const { department } = req.query;

  const filter: Record<string, unknown> = { role: ROLES.DOCTOR, isActive: true };
  if (department) filter.department = String(department);

  const [total, doctors] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .select(PUBLIC_USER_FIELDS)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  res.status(200).json({ success: true, data: doctors, pagination: buildPagination(total, page, limit) });
});

export const getDoctor = asyncHandler(async (req: Request, res: Response) => {
  const doctor = await User.findOne({ _id: req.params.id, role: ROLES.DOCTOR }).select(PUBLIC_USER_FIELDS);
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }
  res.status(200).json({ success: true, data: doctor });
});

export const getDoctorSchedule = asyncHandler(async (req: Request, res: Response) => {
  const doctor = await User.findOne({ _id: req.params.id, role: ROLES.DOCTOR }).select('name schedule');
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }
  res.status(200).json({ success: true, data: { name: doctor.name, schedule: doctor.schedule ?? [] } });
});

export const updateDoctorSchedule = asyncHandler(async (req: Request, res: Response) => {
  const doctor = await User.findOne({ _id: req.params.id, role: ROLES.DOCTOR });
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }
  doctor.schedule = req.body.schedule;
  await doctor.save();
  res.status(200).json({ success: true, message: 'Schedule updated', data: doctor.schedule });
});

export const getServices = async (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: [
      'General Consultation',
      'Cardiology',
      'Neurology',
      'Pediatrics',
      'Orthopedics',
      'Gynecology & Obstetrics',
      'Dermatology',
      'Emergency',
    ],
  });
};