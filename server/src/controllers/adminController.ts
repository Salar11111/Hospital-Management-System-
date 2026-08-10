import type { Request, Response } from 'express';
import { User } from '../models/User.js';
import { Patient } from '../models/Patient.js';
import { Appointment } from '../models/Appointment.js';
import { Prescription } from '../models/Prescription.js';
import { Medicine } from '../models/Medicine.js';
import { LabOrder } from '../models/LabOrder.js';
import { AdminLog } from '../models/AdminLog.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { buildPagination, parsePagination } from '../utils/paginate.js';
import { LOW_STOCK_THRESHOLD, ROLES } from '../config/constants.js';

const startOfDay = (offsetDays = 0): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d;
};

export const getDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const today = startOfDay(0);

  const [
    totalUsers,
    totalPatients,
    todayAppointments,
    pendingLabOrders,
    revenueResult,
    lowStock,
    staffByRole,
    todaysSchedule,
  ] = await Promise.all([
    User.countDocuments(),
    Patient.countDocuments(),
    Appointment.countDocuments({ date: { $gte: today, $lt: startOfDay(1) } }),
    LabOrder.countDocuments({ status: 'Pending' }),
    Prescription.aggregate([
      { $match: { status: 'Dispensed' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: null,
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        },
      },
    ]),
    Medicine.find({ stockQuantity: { $lte: LOW_STOCK_THRESHOLD } })
      .sort({ stockQuantity: 1 })
      .lean(),
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    Appointment.find({ date: { $gte: today, $lt: startOfDay(1) } })
      .populate('patient', 'name patientId')
      .populate('doctor', 'name profile.specialization')
      .sort({ time: 1 }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      counts: {
        totalUsers,
        totalPatients,
        totalDoctors: staffByRole.find((r) => r._id === ROLES.DOCTOR)?.count ?? 0,
        todayAppointments,
        pendingLabOrders,
        revenue: revenueResult[0]?.revenue ?? 0,
      },
      lowStock,
      staffByRole,
      todaysSchedule: todaysSchedule.map((a) => ({
        id: a.id,
        time: a.time,
        status: a.status,
        patientName: (a.patient as unknown as { name?: string })?.name ?? '',
        doctorName: (a.doctor as unknown as { name?: string })?.name ?? '',
      })),
    },
  });
});

export const getAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = parsePagination(req.query);
  const filter: Record<string, unknown> = {};
  if (req.query.action) filter.action = String(req.query.action);

  const [total, logs] = await Promise.all([
    AdminLog.countDocuments(filter),
    AdminLog.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
  ]);

  res.status(200).json({ success: true, data: logs, pagination: buildPagination(total, page, limit) });
});