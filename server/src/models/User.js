import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { GENDERS, ROLES } from '../config/constants.js';
const scheduleSchema = new mongoose.Schema(
  {
    day: { type: String, required: true },
    startTime: { type: String },
    endTime: { type: String },
    isAvailable: { type: Boolean, default: false },
  },
  { _id: false }
);
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 80 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: [true, 'Role is required'],
    },
    phone: { type: String, trim: true },
    department: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    gender: { type: String, enum: GENDERS, default: 'Prefer not to say' },
    avatarColor: { type: String, default: '#0ea5e9' },
    dateOfBirth: { type: Date },
    profile: {
      avatar: { type: String, default: '' },
      qualifications: { type: String, default: '' },
      specialization: { type: String, default: '' },
      experience: { type: Number, default: 0 },
    },
    schedule: { type: [scheduleSchema], default: [] },
    lastLogin: { type: Date },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date },
    refreshTokenHash: { type: String, select: false },
    tokenVersion: { type: Number, default: 0 },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetTokenExpiresAt: { type: Date, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        delete ret.__v;
        delete ret.refreshTokenHash;
        delete ret.passwordResetTokenHash;
        delete ret.passwordResetTokenExpiresAt;
        return ret;
      },
    },
  }
);
userSchema.pre('save', async function (next) {
  const self = this;
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  self.password = await bcrypt.hash(self.password, salt);
  next();
});
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};
userSchema.methods.isLocked = function () {
  return !!this.lockedUntil && this.lockedUntil.getTime() > Date.now();
};
const User = mongoose.model('User', userSchema);
export { User, userSchema };
