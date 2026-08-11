import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminApi,
  appointmentApi,
  dashboardApi,
  doctorApi,
  labApi,
  medicineApi,
  patientApi,
  prescriptionApi,
  recordApi,
  userApi,
} from '../services/api';
const qk = {
  dashboard: ['dashboard'],
  patients: (p) => ['patients', p ?? {}],
  patient: (id) => ['patient', id],
  patientHistory: (id) => ['patient-history', id],
  appointments: (p) => ['appointments', p ?? {}],
  appointment: (id) => ['appointment', id],
  doctors: (p) => ['doctors', p ?? {}],
  doctorSchedule: (id) => ['doctor-schedule', id],
  medicines: (p) => ['medicines', p ?? {}],
  prescriptions: (p) => ['prescriptions', p ?? {}],
  labOrders: (p) => ['lab-orders', p ?? {}],
  records: (patientId) => ['records', patientId],
  users: (p) => ['users', p ?? {}],
  auditLogs: (p) => ['audit-logs', p ?? {}],
};
const useDashboard = (enabled = true) =>
  useQuery({ queryKey: qk.dashboard, queryFn: dashboardApi.stats, enabled });
const usePatients = (params) =>
  useQuery({ queryKey: qk.patients(params), queryFn: () => patientApi.list(params) });
const usePatient = (id) =>
  useQuery({ queryKey: qk.patient(id), queryFn: () => patientApi.get(id), enabled: !!id });
const usePatientHistory = (id) =>
  useQuery({
    queryKey: qk.patientHistory(id),
    queryFn: () => patientApi.history(id),
    enabled: !!id,
  });
const useAppointments = (params) =>
  useQuery({ queryKey: qk.appointments(params), queryFn: () => appointmentApi.list(params) });
const useAppointment = (id) =>
  useQuery({ queryKey: qk.appointment(id), queryFn: () => appointmentApi.get(id), enabled: !!id });
const useDoctors = (params) =>
  useQuery({ queryKey: qk.doctors(params), queryFn: () => doctorApi.list(params) });
const useDoctorSchedule = (id) =>
  useQuery({
    queryKey: qk.doctorSchedule(id),
    queryFn: () => doctorApi.schedule(id),
    enabled: !!id,
  });
const useMedicines = (params) =>
  useQuery({ queryKey: qk.medicines(params), queryFn: () => medicineApi.list(params) });
const usePrescriptions = (params) =>
  useQuery({ queryKey: qk.prescriptions(params), queryFn: () => prescriptionApi.list(params) });
const useLabOrders = (params) =>
  useQuery({ queryKey: qk.labOrders(params), queryFn: () => labApi.list(params) });
const usePatientRecords = (patientId) =>
  useQuery({
    queryKey: qk.records(patientId),
    queryFn: () => recordApi.getByPatient(patientId),
    enabled: !!patientId,
  });
const useUsers = (params) =>
  useQuery({ queryKey: qk.users(params), queryFn: () => userApi.list(params) });
const useAuditLogs = (params) =>
  useQuery({ queryKey: qk.auditLogs(params), queryFn: () => adminApi.auditLogs(params) });
function useUpdatePatientMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => patientApi.update(id, payload),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['patients'] });
      qc.invalidateQueries({ queryKey: qk.patient(vars.id) });
      qc.invalidateQueries({ queryKey: qk.patientHistory(vars.id) });
    },
  });
}
function useBookAppointmentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => appointmentApi.book(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  });
}
function useUpdateAppointmentStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reason }) => appointmentApi.updateStatus(id, status, reason),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      qc.invalidateQueries({ queryKey: qk.appointment(vars.id) });
      qc.invalidateQueries({ queryKey: qk.dashboard });
    },
  });
}
function useCreateMedicineMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => medicineApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medicines'] }),
  });
}
function useUpdateMedicineMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => medicineApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medicines'] }),
  });
}
function useRemoveMedicineMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => medicineApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medicines'] });
      qc.invalidateQueries({ queryKey: qk.dashboard });
    },
  });
}
function useCreatePrescriptionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => prescriptionApi.create(payload),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['prescriptions'] });
      if (typeof vars.patient === 'string')
        qc.invalidateQueries({ queryKey: qk.patientHistory(vars.patient) });
    },
  });
}
function useDispensePrescriptionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => prescriptionApi.dispense(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prescriptions'] });
      qc.invalidateQueries({ queryKey: ['medicines'] });
      qc.invalidateQueries({ queryKey: qk.dashboard });
    },
  });
}
function useCancelPrescriptionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => prescriptionApi.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prescriptions'] }),
  });
}
function useCreateLabOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => labApi.create(payload),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['lab-orders'] });
      if (typeof vars.patient === 'string')
        qc.invalidateQueries({ queryKey: qk.patientHistory(vars.patient) });
    },
  });
}
function useCompleteLabOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, results }) => labApi.complete(id, results),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lab-orders'] });
      qc.invalidateQueries({ queryKey: qk.dashboard });
    },
  });
}
function useCancelLabOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => labApi.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lab-orders'] }),
  });
}
function useCreateRecordMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => recordApi.create(payload),
    onSuccess: (_d, vars) => {
      if (typeof vars.patient === 'string')
        qc.invalidateQueries({ queryKey: qk.records(vars.patient) });
      qc.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}
function useCreateStaffMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => userApi.createStaff(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}
function useUpdateStaffStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }) => userApi.updateStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}
function useRemoveStaffMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => userApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}
function useUpdateDoctorScheduleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, schedule }) => doctorApi.updateSchedule(id, schedule),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: qk.doctorSchedule(vars.id) }),
  });
}
export {
  useAppointment,
  useAppointments,
  useAuditLogs,
  useBookAppointmentMutation,
  useCancelLabOrderMutation,
  useCancelPrescriptionMutation,
  useCompleteLabOrderMutation,
  useCreateLabOrderMutation,
  useCreateMedicineMutation,
  useCreatePrescriptionMutation,
  useCreateRecordMutation,
  useCreateStaffMutation,
  useDashboard,
  useDispensePrescriptionMutation,
  useDoctorSchedule,
  useDoctors,
  useLabOrders,
  useMedicines,
  usePatient,
  usePatientHistory,
  usePatientRecords,
  usePatients,
  usePrescriptions,
  useRemoveMedicineMutation,
  useRemoveStaffMutation,
  useUpdateAppointmentStatusMutation,
  useUpdateDoctorScheduleMutation,
  useUpdateMedicineMutation,
  useUpdatePatientMutation,
  useUpdateStaffStatusMutation,
  useUsers,
};
