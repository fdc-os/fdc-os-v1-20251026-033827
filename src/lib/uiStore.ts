import { create } from 'zustand';
import { Appointment, Patient } from '@shared/types';
interface UiState {
  isAppointmentModalOpen: boolean;
  isPatientModalOpen: boolean;
  isInvoiceModalOpen: boolean;
  editingAppointment: Appointment | null;
  editingPatient: Patient | null;
  toggleAppointmentModal: (appointment?: Appointment | null) => void;
  togglePatientModal: (patient?: Patient | null) => void;
  toggleInvoiceModal: () => void;
}
export const useUiStore = create<UiState>((set) => ({
  isAppointmentModalOpen: false,
  isPatientModalOpen: false,
  isInvoiceModalOpen: false,
  editingAppointment: null,
  editingPatient: null,
  toggleAppointmentModal: (appointment = null) =>
    set((state) => ({
      isAppointmentModalOpen: !state.isAppointmentModalOpen,
      editingAppointment: !state.isAppointmentModalOpen ? appointment : null,
    })),
  togglePatientModal: (patient = null) =>
    set((state) => ({
      isPatientModalOpen: !state.isPatientModalOpen,
      editingPatient: !state.isPatientModalOpen ? patient : null,
    })),
  toggleInvoiceModal: () =>
    set((state) => ({ isInvoiceModalOpen: !state.isInvoiceModalOpen })),
}));