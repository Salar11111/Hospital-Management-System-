import { z } from 'zod';
import { ROLES } from '../config/constants.js';

const emailSchema = z.string().email('Please provide a valid email');

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  email: emailSchema,
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  role: z.enum([
    ROLES.PATIENT,
    ROLES.DOCTOR,
    ROLES.NURSE,
    ROLES.PHARMACIST,
    ROLES.LABTECH,
    ROLES.RECEPTIONIST,
  ]),
  phone: z.string().max(30).optional(),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
});