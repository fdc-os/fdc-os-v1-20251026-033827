import { create } from 'zustand';
import { Appointment } from '@shared/types';
import { api } from './api-client';
interface AppointmentState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  fetchAppointments: () => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<Appointment | null>;
  updateAppointment: (appointment: Appointment) => Promise<Appointment | null>;
  deleteAppointment: (appointmentId: string) => Promise<boolean>;
}
export const useAppointmentStore = create<AppointmentState>((set) => ({
  appointments: [],
  loading: false,
  error: null,
  fetchAppointments: async () => {
    set({ loading: true, error: null });
    try {
      const appointments = await api<Appointment[]>('/api/appointments');
      set({ appointments, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch appointments';
      set({ loading: false, error: errorMessage });
    }
  },
  addAppointment: async (newAppointmentData) => {
    set({ loading: true, error: null });
    try {
      const appointment = await api<Appointment>('/api/appointments', {
        method: 'POST',
        body: JSON.stringify(newAppointmentData),
      });
      set((state) => ({
        appointments: [...state.appointments, appointment],
        loading: false,
      }));
      return appointment;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add appointment';
      set({ loading: false, error: errorMessage });
      return null;
    }
  },
  updateAppointment: async (appointmentToUpdate) => {
    set({ loading: true, error: null });
    try {
      const updatedAppointment = await api<Appointment>(`/api/appointments/${appointmentToUpdate.id}`, {
        method: 'PUT',
        body: JSON.stringify(appointmentToUpdate),
      });
      set((state) => ({
        appointments: state.appointments.map((a) => (a.id === updatedAppointment.id ? updatedAppointment : a)),
        loading: false,
      }));
      return updatedAppointment;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update appointment';
      set({ loading: false, error: errorMessage });
      return null;
    }
  },
  deleteAppointment: async (appointmentId) => {
    set({ loading: true, error: null });
    try {
      await api(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      });
      set((state) => ({
        appointments: state.appointments.filter((a) => a.id !== appointmentId),
        loading: false,
      }));
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete appointment';
      set({ loading: false, error: errorMessage });
      return false;
    }
  },
}));