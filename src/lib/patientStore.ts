import { create } from 'zustand';
import { Patient } from '@shared/types';
import { api } from './api-client';
interface PatientState {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  fetchPatients: () => Promise<void>;
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) => Promise<Patient | null>;
  updatePatient: (patient: Patient) => Promise<Patient | null>;
  deletePatient: (patientId: string) => Promise<boolean>;
}
export const usePatientStore = create<PatientState>((set) => ({
  patients: [],
  loading: false,
  error: null,
  fetchPatients: async () => {
    set({ loading: true, error: null });
    try {
      const patients = await api<Patient[]>('/api/patients');
      set({ patients, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch patients';
      set({ loading: false, error: errorMessage });
    }
  },
  addPatient: async (newPatientData) => {
    set({ loading: true, error: null });
    try {
      const patient = await api<Patient>('/api/patients', {
        method: 'POST',
        body: JSON.stringify(newPatientData),
      });
      set((state) => ({
        patients: [...state.patients, patient],
        loading: false,
      }));
      return patient;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add patient';
      set({ loading: false, error: errorMessage });
      return null;
    }
  },
  updatePatient: async (patientToUpdate) => {
    set({ loading: true, error: null });
    try {
      const updatedPatient = await api<Patient>(`/api/patients/${patientToUpdate.id}`, {
        method: 'PUT',
        body: JSON.stringify(patientToUpdate),
      });
      set((state) => ({
        patients: state.patients.map((p) => (p.id === updatedPatient.id ? updatedPatient : p)),
        loading: false,
      }));
      return updatedPatient;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update patient';
      set({ loading: false, error: errorMessage });
      return null;
    }
  },
  deletePatient: async (patientId) => {
    set({ loading: true, error: null });
    try {
      await api(`/api/patients/${patientId}`, {
        method: 'DELETE',
      });
      set((state) => ({
        patients: state.patients.filter((p) => p.id !== patientId),
        loading: false,
      }));
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete patient';
      set({ loading: false, error: errorMessage });
      return false;
    }
  },
}));