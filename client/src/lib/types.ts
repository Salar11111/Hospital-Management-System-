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

export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'No-Show';
export type PrescriptionStatus = 'Pending' | 'Dispensed' | 'Cancelled';
export type LabOrderStatus = 'Pending' | 'Completed' | 'Cancelled';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  phone?: string;
  avatarColor?: string;
  gender?: string;
  specialization?: string;
  qualifications?: string;
  yearsOfExperience?: number;
  isActive: boolean;
  lastLogin?: string;
  profile?: {
    specialization?: string;
    qualifications?: string;
  };
}

/** Populated reference sub-documents returned by the API. */
export interface PatientRef {
  _id: string;
  name: string;
  patientId?: string;
  contact?: PatientContact;
}

export interface UserRef {
  _id: string;
  name: string;
  specialization?: string;
  department?: string;
  profile?: { specialization?: string };
}

export interface AppointmentRef {
  _id: string;
  date?: string;
  time?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/** Envelope returned by list endpoints: rows + pagination meta at top level. */
export interface PagedResponse<T> extends ApiResponse<T[]> {
  pagination?: Pagination;
}

/** Normalized paginated result consumed by the UI. */
export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PatientContact {
  phone?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
}

export interface Patient {
  _id: string;
  patientId: string;
  name: string;
  user?: string;
  contact?: PatientContact;
  gender?: string;
  dob?: string;
  bloodGroup?: string;
  allergies?: string[];
  insurance?: {
    provider?: string;
    policyNumber?: string;
    expiryDate?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  _id: string;
  patient: PatientRef | string;
  doctor: UserRef | string;
  bookedBy?: string;
  date: string;
  time: string;
  reason: string;
  notes?: string;
  type?: string;
  status: AppointmentStatus;
  cancellationReason?: string;
  consultedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Medicine {
  _id: string;
  name: string;
  genericName?: string;
  category?: string;
  stockQuantity: number;
  price: number;
  expiryDate?: string;
  supplier?: string;
  reorderLevel?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Vitals {
  bp?: string;
  temperature?: string;
  pulse?: number;
  weight?: number;
  height?: number;
}

export interface MedicalRecord {
  _id: string;
  patient: PatientRef | string;
  doctor: UserRef | string;
  appointment?: AppointmentRef | string;
  diagnosis: string;
  symptoms: string;
  vitals?: Vitals;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionItem {
  medicine: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  price?: number;
  instructions?: string;
}

export interface Prescription {
  _id: string;
  patient: PatientRef | string;
  doctor: UserRef | string;
  appointment?: string;
  status: PrescriptionStatus;
  items: PrescriptionItem[];
  notes?: string;
  dispensedAt?: string;
  dispensedBy?: UserRef | string;
  createdAt: string;
  updatedAt: string;
}

export interface LabResult {
  parameter: string;
  value: string;
  unit?: string;
  referenceRange?: string;
}

export interface LabOrder {
  _id: string;
  patient: PatientRef | string;
  doctor: UserRef | string;
  appointment?: string;
  testName: string;
  notes?: string;
  status: LabOrderStatus;
  results?: LabResult[];
  completedAt?: string;
  completedBy?: UserRef | string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  _id: string;
  user?: (UserRef & { email?: string }) | null;
  action: string;
  resource: string;
  resourceId?: string;
  meta?: Record<string, unknown>;
  ip?: string;
  createdAt: string;
}

export interface DashboardCounts {
  totalUsers: number;
  totalPatients: number;
  totalDoctors: number;
  todayAppointments: number;
  pendingLabOrders: number;
  revenue: number;
}

export interface StaffRoleCount {
  _id: string;
  count: number;
}

export interface TodayAppointment {
  id: string;
  time: string;
  status: AppointmentStatus;
  patientName: string;
  doctorName: string;
}

export interface DashboardStats {
  counts: DashboardCounts;
  lowStock: Medicine[];
  staffByRole: StaffRoleCount[];
  todaysSchedule: TodayAppointment[];
}

export interface DoctorScheduleEntry {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface DoctorSchedule {
  name: string;
  schedule: DoctorScheduleEntry[];
}

export interface PatientHistory {
  patient: Patient;
  medicalRecords: MedicalRecord[];
  labOrders: LabOrder[];
  prescriptions: Prescription[];
}