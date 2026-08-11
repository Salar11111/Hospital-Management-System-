import { LabOrder } from '../models/LabOrder.js';
import { Patient } from '../models/Patient.js';
import { ApiError } from '../middleware/error.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { buildPagination, parsePagination } from '../utils/paginate.js';
import { writeAuditLog } from '../utils/audit.js';
import { ROLES } from '../config/constants.js';
const POPULATE = [
  { path: 'patient', select: 'name patientId contact' },
  { path: 'doctor', select: 'name profile.specialization' },
  { path: 'completedBy', select: 'name' },
];
const listLabOrders = asyncHandler(async (req, res) => {
  const user = req.user;
  const { page, limit } = parsePagination(req.query);
  const filter = {};
  switch (user.role) {
    case ROLES.DOCTOR:
      filter.doctor = user._id;
      break;
    case ROLES.PATIENT: {
      const patient = await Patient.findOne({ user: user._id });
      if (!patient) {
        res
          .status(200)
          .json({ success: true, data: [], pagination: buildPagination(0, page, limit) });
        return;
      }
      filter.patient = patient._id;
      break;
    }
    default:
      break;
  }
  if (req.query.status) filter.status = String(req.query.status);
  if (req.query.patient) filter.patient = String(req.query.patient);
  if (req.query.doctor) filter.doctor = String(req.query.doctor);
  const [total, orders] = await Promise.all([
    LabOrder.countDocuments(filter),
    LabOrder.find(filter)
      .populate(POPULATE)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);
  res
    .status(200)
    .json({ success: true, data: orders, pagination: buildPagination(total, page, limit) });
});
const getLabOrder = asyncHandler(async (req, res) => {
  const order = await LabOrder.findById(req.params.id).populate(POPULATE);
  if (!order) throw new ApiError(404, 'Lab order not found');
  res.status(200).json({ success: true, data: order });
});
const createLabOrder = asyncHandler(async (req, res) => {
  const user = req.user;
  const { patient, appointment, testName, notes } = req.body;
  const patientDoc = await Patient.findById(patient);
  if (!patientDoc) throw new ApiError(404, 'Patient not found');
  const order = await LabOrder.create({
    patient,
    doctor: user._id,
    appointment,
    testName,
    status: 'Pending',
    notes,
  });
  await writeAuditLog({
    req,
    action: 'lab.order',
    resource: 'lab',
    resourceId: order.id,
    meta: { patient: patientDoc.patientId, testName },
  });
  res.status(201).json({ success: true, message: 'Lab test ordered', data: order });
});
const completeLabOrder = asyncHandler(async (req, res) => {
  const user = req.user;
  const order = await LabOrder.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Lab order not found');
  if (order.status === 'Completed') {
    throw new ApiError(409, 'Lab order already completed');
  }
  if (order.status === 'Cancelled') {
    throw new ApiError(409, 'Cancelled lab orders cannot be completed');
  }
  if (!Array.isArray(req.body.results) || req.body.results.length === 0) {
    throw new ApiError(400, 'At least one result is required');
  }
  order.results = req.body.results;
  order.status = 'Completed';
  order.completedAt = /* @__PURE__ */ new Date();
  order.completedBy = user._id;
  await order.save();
  await writeAuditLog({
    req,
    action: 'lab.complete',
    resource: 'lab',
    resourceId: order.id,
    meta: { resultCount: req.body.results.length },
  });
  res.status(200).json({ success: true, message: 'Lab order completed', data: order });
});
const cancelLabOrder = asyncHandler(async (req, res) => {
  const order = await LabOrder.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Lab order not found');
  if (order.status === 'Completed') {
    throw new ApiError(409, 'Completed lab orders cannot be cancelled');
  }
  order.status = 'Cancelled';
  await order.save();
  res.status(200).json({ success: true, message: 'Lab order cancelled', data: order });
});
export { cancelLabOrder, completeLabOrder, createLabOrder, getLabOrder, listLabOrders };
