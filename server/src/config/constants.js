const ROLES = {
  ADMIN: 'Admin',
  DOCTOR: 'Doctor',
  NURSE: 'Nurse',
  RECEPTIONIST: 'Receptionist',
  PATIENT: 'Patient',
  PHARMACIST: 'Pharmacist',
  LABTECH: 'LabTech',
};
const ROLE_LIST = Object.values(ROLES);
const APPOINTMENT_STATUS = ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'No-Show'];
const PRESCRIPTION_STATUS = ['Pending', 'Dispensed', 'Cancelled'];
const LAB_ORDER_STATUS = ['Pending', 'Completed', 'Cancelled'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const AUTH = {
  MAX_FAILED_ATTEMPTS: 5,
  LOCKOUT_MS: 15 * 60 * 1e3,
  // Session timeout after 15 minutes of inactivity (client enforced, ref. PDF spec)
  SESSION_TIMEOUT_MS: 15 * 60 * 1e3,
};
const COOKIE_NAMES = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
};
const PATIENT_ID_PREFIX = 'PDT';
const LOW_STOCK_THRESHOLD = 20;
const PUBLIC_USER_FIELDS =
  'name email role department phone avatarColor gender specialization qualifications yearsOfExperience';
export {
  APPOINTMENT_STATUS,
  AUTH,
  BLOOD_GROUPS,
  COOKIE_NAMES,
  GENDERS,
  LAB_ORDER_STATUS,
  LOW_STOCK_THRESHOLD,
  PATIENT_ID_PREFIX,
  PRESCRIPTION_STATUS,
  PUBLIC_USER_FIELDS,
  ROLES,
  ROLE_LIST,
};
