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
import type { DoctorSchedule, LabOrder, MedicalRecord, Patient, Prescription } from '../lib/types';

type QueryParams = Record<string, unknown> | undefined;

const qk = {
  dashboard: ['dashboard'] as const,
  patients: (p: QueryParams) => ['patients', p ?? {}] as const,
  patient: (id: string) => ['patient', id] as const,
  patientHistory: (id: string) => ['patient-history', id] as const,
  appointments: (p: QueryParams) => ['appointments', p ?? {}] as const,
  appointment: (id: string) => ['appointment', id] as const,
  doctors: (p: QueryParams) => ['doctors', p ?? {}] as const,
  doctorSchedule: (id: string) => ['doctor-schedule', id] as const,
  medicines: (p: QueryParams) => ['medicines', p ?? {}] as const,
  prescriptions: (p: QueryParams) => ['prescriptions', p ?? {}] as const,
  labOrders: (p: QueryParams) => ['lab-orders', p ?? {}] as const,
  records: (patientId: string) => ['records', patientId] as const,
  users: (p: QueryParams) => ['users', p ?? {}] as const,
  auditLogs: (p: QueryParams) => ['audit-logs', p ?? {}] as const,
};

export const useDashboard = (enabled = true) =>
  useQuery({ queryKey: qk.dashboard, queryFn: dashboardApi.stats, enabled });

export const usePatients = (params?: QueryParams) =>
  useQuery({ queryKey: qk.patients(params), queryFn: () => patientApi.list(params) });

export const usePatient = (id: string) =>
  useQuery({ queryKey: qk.patient(id), queryFn: () => patientApi.get(id), enabled: !!id });

export const usePatientHistory = (id: string) =>
  useQuery({ queryKey: qk.patientHistory(id), queryFn: () => patientApi.history(id), enabled: !!id });

export const useAppointments = (params?: QueryParams) =>
  useQuery({ queryKey: qk.appointments(params), queryFn: () => appointmentApi.list(params) });

export const useAppointment = (id: string) =>
  useQuery({ queryKey: qk.appointment(id), queryFn: () => appointmentApi.get(id), enabled: !!id });

export const useDoctors = (params?: QueryParams) =>
  useQuery({ queryKey: qk.doctors(params), queryFn: () => doctorApi.list(params) });

export const useDoctorSchedule = (id: string) =>
  useQuery({ queryKey: qk.doctorSchedule(id), queryFn: () => doctorApi.schedule(id), enabled: !!id });

export const useMedicines = (params?: QueryParams) =>
  useQuery({ queryKey: qk.medicines(params), queryFn: () => medicineApi.list(params) });

export const usePrescriptions = (params?: QueryParams) =>
  useQuery({ queryKey: qk.prescriptions(params), queryFn: () => prescriptionApi.list(params) });

export const useLabOrders = (params?: QueryParams) =>
  useQuery({ queryKey: qk.labOrders(params), queryFn: () => labApi.list(params) });

export const usePatientRecords = (patientId: string) =>
  useQuery({ queryKey: qk.records(patientId), queryFn: () => recordApi.getByPatient(patientId), enabled: !!patientId });

export const useUsers = (params?: QueryParams) =>
  useQuery({ queryKey: qk.users(params), queryFn: () => userApi.list(params) });

export const useAuditLogs = (params?: QueryParams) =>
  useQuery({ queryKey: qk.auditLogs(params), queryFn: () => adminApi.auditLogs(params) });

// ---- Mutations ---------------------------------------------------------------

export function useUpdatePatientMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => patientApi.update(id, payload),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['patients'] });
      qc.invalidateQueries({ queryKey: qk.patient(vars.id) });
      qc.invalidateQueries({ queryKey: qk.patientHistory(vars.id) });
    },
  });
}

export function useBookAppointmentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => appointmentApi.book(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  });
}

export function useUpdateAppointmentStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      appointmentApi.updateStatus(id, status, reason),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      qc.invalidateQueries({ queryKey: qk.appointment(vars.id) });
      qc.invalidateQueries({ queryKey: qk.dashboard });
    },
  });
}

export function useCreateMedicineMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => medicineApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medicines'] }),
  });
}

export function useUpdateMedicineMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => medicineApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medicines'] }),
  });
}

export function useRemoveMedicineMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => medicineApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medicines'] });
      qc.invalidateQueries({ queryKey: qk.dashboard });
    },
  });
}

export function useCreatePrescriptionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => prescriptionApi.create(payload),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['prescriptions'] });
      if (typeof vars.patient === 'string') qc.invalidateQueries({ queryKey: qk.patientHistory(vars.patient) });
    },
  });
}

export function useDispensePrescriptionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => prescriptionApi.dispense(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prescriptions'] });
      qc.invalidateQueries({ queryKey: ['medicines'] });
      qc.invalidateQueries({ queryKey: qk.dashboard });
    },
  });
}

export function useCancelPrescriptionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => prescriptionApi.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prescriptions'] }),
  });
}

export function useCreateLabOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => labApi.create(payload),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['lab-orders'] });
      if (typeof vars.patient === 'string') qc.invalidateQueries({ queryKey: qk.patientHistory(vars.patient) });
    },
  });
}

export function useCompleteLabOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, results }: { id: string; results: LabOrder['results'] }) => labApi.complete(id, results),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lab-orders'] });
      qc.invalidateQueries({ queryKey: qk.dashboard });
    },
  });
}

export function useCancelLabOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => labApi.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lab-orders'] }),
  });
}

export function useCreateRecordMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => recordApi.create(payload),
    onSuccess: (_d, vars) => {
      if (typeof vars.patient === 'string') qc.invalidateQueries({ queryKey: qk.records(vars.patient) });
      qc.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useCreateStaffMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => userApi.createStaff(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateStaffStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => userApi.updateStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useRemoveStaffMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateDoctorScheduleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, schedule }: { id: string; schedule: DoctorSchedule['schedule'] }) =>
      doctorApi.updateSchedule(id, schedule),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: qk.doctorSchedule(vars.id) }),
  });
}

export type { MedicalRecord, Patient, Prescription };