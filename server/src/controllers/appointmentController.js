import { Appointment } from '../models/Appointment.js';
import { Patient } from '../models/Patient.js';
import { User } from '../models/User.js';
import { ApiError } from '../middleware/error.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { buildPagination, parsePagination } from '../utils/paginate.js';
import { writeAuditLog } from '../utils/audit.js';
import { APPOINTMENT_STATUS, ROLES } from '../config/constants.js';
const POPULATE_PATIENT = { path: 'patient', select: 'name patientId contact bloodGroup' };
const POPULATE_DOCTOR = { path: 'doctor', select: 'name specialization department profile' };
const buildFilter = (req) => {
  const user = req.user;
  const filter = {};
  switch (user.role) {
    case ROLES.DOCTOR:
      filter.doctor = user._id;
      break;
    case ROLES.PATIENT: {
      filter.bookedBy = user._id;
      break;
    }
    default:
      break;
  }
  if (req.query.status) filter.status = String(req.query.status);
  if (req.query.doctor) filter.doctor = String(req.query.doctor);
  if (req.query.patient) filter.patient = String(req.query.patient);
  if (req.query.from || req.query.to) {
    const from = req.query.from ? new Date(String(req.query.from)) : /* @__PURE__ */ new Date(0);
    const to = req.query.to
      ? new Date(String(req.query.to))
      : /* @__PURE__ */ new Date('2100-01-01');
    filter.date = { $gte: from, $lte: to };
  }
  return filter;
};
const listAppointments = asyncHandler(async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const filter = buildFilter(req);
  const [total, appointments] = await Promise.all([
    Appointment.countDocuments(filter),
    Appointment.find(filter)
      .populate(POPULATE_PATIENT)
      .populate(POPULATE_DOCTOR)
      .sort({ date: 1, time: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);
  res
    .status(200)
    .json({ success: true, data: appointments, pagination: buildPagination(total, page, limit) });
});
const getAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate(POPULATE_PATIENT)
    .populate(POPULATE_DOCTOR);
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }
  assertCanView(req, appointment);
  res.status(200).json({ success: true, data: appointment });
});
const assertCanView = (req, appointment) => {
  const user = req.user;
  if (user.role === ROLES.DOCTOR && appointment.doctor.toString() !== user._id.toString()) {
    throw new ApiError(403, 'You can only view your own appointments');
  }
};
const bookAppointment = asyncHandler(async (req, res) => {
  const user = req.user;
  const { patient, doctor, date, time, notes, type } = req.body;
  const patientDoc = await Patient.findById(patient);
  if (!patientDoc) throw new ApiError(404, 'Patient not found');
  const doctorDoc = await User.findOne({ _id: doctor, role: ROLES.DOCTOR });
  if (!doctorDoc) throw new ApiError(404, 'Doctor not found');
  const clash = await Appointment.findOne({
    doctor,
    date: new Date(date),
    time,
    status: { $ne: 'Cancelled' },
  });
  if (clash) {
    throw new ApiError(409, 'This time slot is already booked for this doctor');
  }
  const appointment = await Appointment.create({
    patient,
    doctor,
    bookedBy: user._id,
    date: new Date(date),
    time,
    status:
      user.role === ROLES.DOCTOR || user.role === ROLES.RECEPTIONIST ? 'Confirmed' : 'Pending',
    reason: req.body.reason,
    notes,
    type,
  });
  await writeAuditLog({
    req,
    action: 'appointment.book',
    resource: 'appointment',
    resourceId: appointment.id,
    meta: { patient: patientDoc.patientId, doctor: doctorDoc.name },
  });
  res.status(201).json({ success: true, message: 'Appointment booked', data: appointment });
});
async function performStatusUpdate(req, res) {
  const { status, cancellationReason } = req.body;
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }
  if (!APPOINTMENT_STATUS.includes(status)) {
    throw new ApiError(400, 'Invalid appointment status');
  }
  const user = req.user;
  if (user.role === ROLES.PATIENT) {
    const ownPatient = await Patient.findOne({ user: user._id });
    if (!ownPatient || appointment.patient.toString() !== ownPatient._id.toString()) {
      throw new ApiError(403, 'You can only update your own appointments');
    }
    if (status !== 'Cancelled') {
      throw new ApiError(403, 'Patients may only cancel appointments');
    }
  }
  if (appointment.status === 'Cancelled' && appointment.status !== status) {
    throw new ApiError(409, 'Cancelled appointments cannot be changed');
  }
  appointment.status = status;
  if (status === 'Cancelled')
    appointment.cancellationReason = cancellationReason ?? 'Cancelled by user';
  if (status === 'Completed') appointment.consultedAt = /* @__PURE__ */ new Date();
  await appointment.save();
  await writeAuditLog({
    req,
    action: 'appointment.status',
    resource: 'appointment',
    resourceId: appointment.id,
    meta: { from: appointment.status, to: status },
  });
  res
    .status(200)
    .json({ success: true, message: `Appointment marked ${status}`, data: appointment });
}
const updateAppointmentStatus = asyncHandler(performStatusUpdate);
const cancelAppointment = asyncHandler(async (req, res) => {
  req.body.status = 'Cancelled';
  await performStatusUpdate(req, res);
});
export {
  bookAppointment,
  cancelAppointment,
  getAppointment,
  listAppointments,
  updateAppointmentStatus,
};
