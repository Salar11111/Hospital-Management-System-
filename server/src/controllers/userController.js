import { User } from '../models/User.js';
import { Patient } from '../models/Patient.js';
import { ROLES } from '../config/constants.js';
import { ApiError } from '../middleware/error.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { buildPagination, parsePagination } from '../utils/paginate.js';
import { writeAuditLog } from '../utils/audit.js';
const STAFF_ROLES = [ROLES.ADMIN, ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.PHARMACIST, ROLES.LABTECH];
const SELECT = 'name email role department phone isActive gender avatarColor profile lastLogin';
const listUsers = asyncHandler(async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const filter = {};
  if (req.query.role) filter.role = String(req.query.role);
  if (req.query.search) {
    const search = String(req.query.search);
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .select(SELECT)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);
  res
    .status(200)
    .json({ success: true, data: users, pagination: buildPagination(total, page, limit) });
});
const createStaff = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, department, gender } = req.body;
  if (!STAFF_ROLES.includes(role)) {
    throw new ApiError(
      400,
      'Only staff roles (Nurse, Receptionist, Pharmacist, LabTech) can be created here'
    );
  }
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'An account with this email already exists');
  const user = await User.create({
    name,
    email,
    password,
    role,
    phone,
    department,
    gender,
  });
  await writeAuditLog({
    req,
    action: 'staff.create',
    resource: 'user',
    resourceId: user.id,
    meta: { role },
  });
  res.status(201).json({ success: true, message: 'Staff account created', data: user.toJSON() });
});
const updateStaffStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  if (user.role === ROLES.ADMIN) {
    throw new ApiError(400, 'The admin account cannot be deactivated');
  }
  user.isActive = req.body.isActive;
  await user.save();
  await writeAuditLog({
    req,
    action: req.body.isActive ? 'staff.activate' : 'staff.deactivate',
    resource: 'user',
    resourceId: user.id,
  });
  res.status(200).json({ success: true, message: 'Staff status updated', data: user.toJSON() });
});
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  if (user.role === ROLES.ADMIN) throw new ApiError(400, 'The admin account cannot be deleted');
  await User.findByIdAndDelete(user._id);
  await Patient.deleteMany({ user: user._id });
  await writeAuditLog({
    req,
    action: 'user.delete',
    resource: 'user',
    resourceId: user.id,
  });
  res.status(200).json({ success: true, message: 'User deleted' });
});
export { createStaff, deleteUser, listUsers, updateStaffStatus };
