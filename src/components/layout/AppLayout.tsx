import React, { useEffect } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { Header } from './Header';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/lib/auth';
import { usePatientStore } from '@/lib/patientStore';
import { useServiceStore } from '@/lib/serviceStore';
import { useAppointmentStore } from '@/lib/appointmentStore';
import { useInvoiceStore } from '@/lib/invoiceStore';
import { useInventoryStore } from '@/lib/inventoryStore';
import { useSettingsStore } from '@/lib/settingsStore';
import { ChatWidget } from '@/components/ChatWidget';
import { UserRole } from '@shared/types';
import { GlobalModals } from '@/components/GlobalModals';
export function AppLayout(): JSX.Element {
  const { user, fetchUsers } = useAuthStore();
  const fetchPatients = usePatientStore((state) => state.fetchPatients);
  const fetchServices = useServiceStore((state) => state.fetchServices);
  const fetchAppointments = useAppointmentStore((state) => state.fetchAppointments);
  const fetchInvoices = useInvoiceStore((state) => state.fetchInvoices);
  const fetchInventoryItems = useInventoryStore((state) => state.fetchInventoryItems);
  const fetchPermissions = useSettingsStore((state) => state.fetchPermissions);
  useEffect(() => {
    // Fetch all necessary data when the app layout mounts
    fetchUsers();
    fetchPatients();
    fetchServices();
    fetchAppointments();
    fetchInvoices();
    fetchInventoryItems();
    fetchPermissions();
  }, [fetchUsers, fetchPatients, fetchServices, fetchAppointments, fetchInvoices, fetchInventoryItems, fetchPermissions]);
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <AppSidebar />
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          <Outlet />
          <Toaster richColors />
        </main>
      </div>
      {user && user.role !== UserRole.Patient && <ChatWidget />}
      <GlobalModals />
    </div>
  );
}