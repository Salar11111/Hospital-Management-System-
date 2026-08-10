export const ROLES = {
  ADMIN: 'Admin',
  DOCTOR: 'Doctor',
  NURSE: 'Nurse',
  RECEPTIONIST: 'Receptionist',
  PATIENT: 'Patient',
  PHARMACIST: 'Pharmacist',
  LABTECH: 'LabTech',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LIST: Role[] = Object.values(ROLES);

export const APPOINTMENT_STATUS = ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'No-Show'] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUS)[number];

export const PRESCRIPTION_STATUS = ['Pending', 'Dispensed', 'Cancelled'] as const;
export type PrescriptionStatus = (typeof PRESCRIPTION_STATUS)[number];

export const LAB_ORDER_STATUS = ['Pending', 'Completed', 'Cancelled'] as const;
export type LabOrderStatus = (typeof LAB_ORDER_STATUS)[number];

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'] as const;
export const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'] as const;

export const AUTH = {
  MAX_FAILED_ATTEMPTS: 5,
  LOCKOUT_MS: 15 * 60 * 1000,
  // Session timeout after 15 minutes of inactivity (client enforced, ref. PDF spec)
  SESSION_TIMEOUT_MS: 15 * 60 * 1000,
};

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;

export const PATIENT_ID_PREFIX = 'PDT';

// Volume constants that keep "today" data visible in demos.
export const LOW_STOCK_THRESHOLD = 20;

export const PUBLIC_USER_FIELDS =
  'name email role department phone avatarColor gender specialization qualifications yearsOfExperience';