import { useUiStore } from '@/lib/uiStore';
import { CreateAppointmentForm } from '@/components/CreateAppointmentForm';
import { CreatePatientForm } from '@/components/CreatePatientForm';
import { CreateInvoiceForm } from '@/components/CreateInvoiceForm';
export function GlobalModals() {
  const isAppointmentModalOpen = useUiStore(
    (state) => state.isAppointmentModalOpen,
  );
  const toggleAppointmentModal = useUiStore(
    (state) => state.toggleAppointmentModal,
  );
  const isPatientModalOpen = useUiStore((state) => state.isPatientModalOpen);
  const togglePatientModal = useUiStore((state) => state.togglePatientModal);
  const isInvoiceModalOpen = useUiStore((state) => state.isInvoiceModalOpen);
  const toggleInvoiceModal = useUiStore((state) => state.toggleInvoiceModal);
  const editingAppointment = useUiStore((state) => state.editingAppointment);
  const editingPatient = useUiStore((state) => state.editingPatient);
  return (
    <>
      <CreateAppointmentForm
        isOpen={isAppointmentModalOpen}
        onOpenChange={() => toggleAppointmentModal(null)}
        appointment={editingAppointment}
      />
      <CreatePatientForm
        isOpen={isPatientModalOpen}
        onOpenChange={() => togglePatientModal(null)}
        patient={editingPatient}
      />
      <CreateInvoiceForm
        isOpen={isInvoiceModalOpen}
        onOpenChange={() => toggleInvoiceModal()}
      />
    </>
  );
}