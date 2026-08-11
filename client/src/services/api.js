import { api } from '../lib/api';
function data(res) {
  if (res.data.data === void 0) throw new Error('Empty response from server');
  return res.data.data;
}
function paged(res) {
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
const authApi = {
  register: async (payload) => data(await api.post('/auth/register', payload)),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};
const dashboardApi = {
  stats: async () => data(await api.get('/admin/dashboard')),
};
const patientApi = {
  list: async (params) => paged(await api.get('/patients', { params })),
  get: async (id) => data(await api.get(`/patients/${id}`)),
  update: async (id, payload) => data(await api.patch(`/patients/${id}`, payload)),
  history: async (id) => data(await api.get(`/patients/${id}/history`)),
};
const appointmentApi = {
  list: async (params) => paged(await api.get('/appointments', { params })),
  get: async (id) => data(await api.get(`/appointments/${id}`)),
  book: async (payload) => data(await api.post('/appointments', payload)),
  updateStatus: async (id, status, cancellationReason) =>
    data(await api.patch(`/appointments/${id}/status`, { status, cancellationReason })),
  cancel: async (id) => data(await api.delete(`/appointments/${id}`)),
};
const doctorApi = {
  list: async (params) => paged(await api.get('/doctors', { params })),
  get: async (id) => data(await api.get(`/doctors/${id}`)),
  schedule: async (id) => data(await api.get(`/doctors/${id}/schedule`)),
  updateSchedule: async (id, schedule) =>
    data(await api.put(`/doctors/${id}/schedule`, { schedule })),
  services: async () => data(await api.get('/doctors/services')),
};
const medicineApi = {
  list: async (params) => paged(await api.get('/medicines', { params })),
  get: async (id) => data(await api.get(`/medicines/${id}`)),
  create: async (payload) => data(await api.post('/medicines', payload)),
  update: async (id, payload) => data(await api.patch(`/medicines/${id}`, payload)),
  remove: async (id) => data(await api.delete(`/medicines/${id}`)),
};
const prescriptionApi = {
  list: async (params) => paged(await api.get('/prescriptions', { params })),
  get: async (id) => data(await api.get(`/prescriptions/${id}`)),
  create: async (payload) => data(await api.post('/prescriptions', payload)),
  dispense: async (id) => data(await api.post(`/prescriptions/${id}/dispense`)),
  cancel: async (id) => data(await api.patch(`/prescriptions/${id}/cancel`)),
};
const labApi = {
  list: async (params) => paged(await api.get('/lab-orders', { params })),
  get: async (id) => data(await api.get(`/lab-orders/${id}`)),
  create: async (payload) => data(await api.post('/lab-orders', payload)),
  complete: async (id, results) => data(await api.post(`/lab-orders/${id}/complete`, { results })),
  cancel: async (id) => data(await api.patch(`/lab-orders/${id}/cancel`)),
};
const recordApi = {
  getByPatient: async (patientId) =>
    (await api.get(`/medical-records/patient/${patientId}`)).data.data ?? [],
  get: async (id) => data(await api.get(`/medical-records/${id}`)),
  create: async (payload) => data(await api.post('/medical-records', payload)),
  update: async (id, payload) => data(await api.patch(`/medical-records/${id}`, payload)),
};
const userApi = {
  list: async (params) => paged(await api.get('/users', { params })),
  createStaff: async (payload) => data(await api.post('/users', payload)),
  updateStatus: async (id, isActive) => data(await api.patch(`/users/${id}/status`, { isActive })),
  remove: async (id) => data(await api.delete(`/users/${id}`)),
};
const adminApi = {
  auditLogs: async (params) => paged(await api.get('/admin/audit-logs', { params })),
};
export {
  adminApi,
  appointmentApi,
  authApi,
  dashboardApi,
  doctorApi,
  labApi,
  medicineApi,
  patientApi,
  prescriptionApi,
  recordApi,
  userApi,
};
