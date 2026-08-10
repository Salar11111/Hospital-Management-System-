import { api } from '../lib/api';
import type {
  ApiResponse,
  AuditLog,
  Appointment,
  DashboardStats,
  DoctorSchedule,
  LabOrder,
  MedicalRecord,
  Medicine,
  PagedResponse,
  PagedResult,
  Patient,
  PatientHistory,
  Prescription,
  User,
} from '../lib/types';

function data<T>(res: { data: ApiResponse<T> }): T {
  if (res.data.data === undefined) throw new Error('Empty response from server');
  return res.data.data;
}

function paged<T>(res: { data: PagedResponse<T> }): PagedResult<T> {
  const items = res.data.data ?? [];
  const p = res.data.pagination;
  return {
    items,
    total: p?.total ?? items.length,
    page: p?.page ?? 1,
    limit: p?.limit ?? items.length,
    totalPages: p?.pages ?? (items.length > 0 ? 1 : 0),
  };
}

export const authApi = {
  register: async (payload: Record<string, unknown>) =>
    data(await api.post<ApiResponse<User>>('/auth/register', payload)),
  forgotPassword: (email: string) =>
    api.post<ApiResponse<unknown> & { devToken?: string }>('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
};

export const dashboardApi = {
  stats: async () => data(await api.get<ApiResponse<DashboardStats>>('/admin/dashboard')),
};

export const patientApi = {
  list: async (params?: Record<string, unknown>) =>
    paged<Patient>(await api.get<PagedResponse<Patient>>('/patients', { params })),
  get: async (id: string) => data(await api.get<ApiResponse<Patient>>(`/patients/${id}`)),
  update: async (id: string, payload: Record<string, unknown>) =>
    data(await api.patch<ApiResponse<Patient>>(`/patients/${id}`, payload)),
  history: async (id: string) => data(await api.get<ApiResponse<PatientHistory>>(`/patients/${id}/history`)),
};

export const appointmentApi = {
  list: async (params?: Record<string, unknown>) =>
    paged<Appointment>(await api.get<PagedResponse<Appointment>>('/appointments', { params })),
  get: async (id: string) => data(await api.get<ApiResponse<Appointment>>(`/appointments/${id}`)),
  book: async (payload: Record<string, unknown>) =>
    data(await api.post<ApiResponse<Appointment>>('/appointments', payload)),
  updateStatus: async (id: string, status: string, cancellationReason?: string) =>
    data(
      await api.patch<ApiResponse<Appointment>>(`/appointments/${id}/status`, { status, cancellationReason })
    ),
  cancel: async (id: string) => data(await api.delete<ApiResponse<Appointment>>(`/appointments/${id}`)),
};

export const doctorApi = {
  list: async (params?: Record<string, unknown>) =>
    paged<User>(await api.get<PagedResponse<User>>('/doctors', { params })),
  get: async (id: string) => data(await api.get<ApiResponse<User>>(`/doctors/${id}`)),
  schedule: async (id: string) => data(await api.get<ApiResponse<DoctorSchedule>>(`/doctors/${id}/schedule`)),
  updateSchedule: async (id: string, schedule: DoctorSchedule['schedule']) =>
    data(await api.put<ApiResponse<DoctorSchedule['schedule']>>(`/doctors/${id}/schedule`, { schedule })),
  services: async () => data(await api.get<ApiResponse<string[]>>('/doctors/services')),
};

export const medicineApi = {
  list: async (params?: Record<string, unknown>) =>
    paged<Medicine>(await api.get<PagedResponse<Medicine>>('/medicines', { params })),
  get: async (id: string) => data(await api.get<ApiResponse<Medicine>>(`/medicines/${id}`)),
  create: async (payload: Record<string, unknown>) =>
    data(await api.post<ApiResponse<Medicine>>('/medicines', payload)),
  update: async (id: string, payload: Record<string, unknown>) =>
    data(await api.patch<ApiResponse<Medicine>>(`/medicines/${id}`, payload)),
  remove: async (id: string) => data(await api.delete<ApiResponse<Medicine>>(`/medicines/${id}`)),
};

export const prescriptionApi = {
  list: async (params?: Record<string, unknown>) =>
    paged<Prescription>(await api.get<PagedResponse<Prescription>>('/prescriptions', { params })),
  get: async (id: string) => data(await api.get<ApiResponse<Prescription>>(`/prescriptions/${id}`)),
  create: async (payload: Record<string, unknown>) =>
    data(await api.post<ApiResponse<Prescription>>('/prescriptions', payload)),
  dispense: async (id: string) => data(await api.post<ApiResponse<Prescription>>(`/prescriptions/${id}/dispense`)),
  cancel: async (id: string) => data(await api.patch<ApiResponse<Prescription>>(`/prescriptions/${id}/cancel`)),
};

export const labApi = {
  list: async (params?: Record<string, unknown>) =>
    paged<LabOrder>(await api.get<PagedResponse<LabOrder>>('/lab-orders', { params })),
  get: async (id: string) => data(await api.get<ApiResponse<LabOrder>>(`/lab-orders/${id}`)),
  create: async (payload: Record<string, unknown>) =>
    data(await api.post<ApiResponse<LabOrder>>('/lab-orders', payload)),
  complete: async (id: string, results: LabOrder['results']) =>
    data(await api.post<ApiResponse<LabOrder>>(`/lab-orders/${id}/complete`, { results })),
  cancel: async (id: string) => data(await api.patch<ApiResponse<LabOrder>>(`/lab-orders/${id}/cancel`)),
};

export const recordApi = {
  getByPatient: async (patientId: string) =>
    (await api.get<ApiResponse<MedicalRecord[]>>(`/medical-records/patient/${patientId}`)).data.data ?? [],
  get: async (id: string) => data(await api.get<ApiResponse<MedicalRecord>>(`/medical-records/${id}`)),
  create: async (payload: Record<string, unknown>) =>
    data(await api.post<ApiResponse<MedicalRecord>>('/medical-records', payload)),
  update: async (id: string, payload: Record<string, unknown>) =>
    data(await api.patch<ApiResponse<MedicalRecord>>(`/medical-records/${id}`, payload)),
};

export const userApi = {
  list: async (params?: Record<string, unknown>) =>
    paged<User>(await api.get<PagedResponse<User>>('/users', { params })),
  createStaff: async (payload: Record<string, unknown>) =>
    data(await api.post<ApiResponse<User>>('/users', payload)),
  updateStatus: async (id: string, isActive: boolean) =>
    data(await api.patch<ApiResponse<User>>(`/users/${id}/status`, { isActive })),
  remove: async (id: string) => data(await api.delete<ApiResponse<User>>(`/users/${id}`)),
};

export const adminApi = {
  auditLogs: async (params?: Record<string, unknown>) =>
    paged<AuditLog>(await api.get<PagedResponse<AuditLog>>('/admin/audit-logs', { params })),
};