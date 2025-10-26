import { create } from 'zustand';
import { Invoice, InvoiceStatus } from '@shared/types';
import { api } from './api-client';
interface InvoiceState {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  fetchInvoices: () => Promise<void>;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<Invoice | null>;
  recordPayment: (invoiceId: string, amount: number) => Promise<Invoice | null>;
  getNextInvoiceNumber: () => string;
}
export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoices: [],
  loading: false,
  error: null,
  fetchInvoices: async () => {
    set({ loading: true, error: null });
    try {
      const invoices = await api<Invoice[]>('/api/invoices');
      set({ invoices, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch invoices';
      set({ loading: false, error: errorMessage });
    }
  },
  addInvoice: async (newInvoiceData) => {
    set({ loading: true, error: null });
    try {
      const invoice = await api<Invoice>('/api/invoices', {
        method: 'POST',
        body: JSON.stringify(newInvoiceData),
      });
      set((state) => ({
        invoices: [...state.invoices, invoice],
        loading: false,
      }));
      return invoice;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add invoice';
      set({ loading: false, error: errorMessage });
      return null;
    }
  },
  recordPayment: async (invoiceId, amount) => {
    const invoice = get().invoices.find(i => i.id === invoiceId);
    if (!invoice) {
      set({ error: 'Invoice not found' });
      return null;
    }
    // This is a simplified logic. A real app would track payments.
    // For now, we just update the status.
    const newStatus = amount >= invoice.total_amount ? InvoiceStatus.Paid : InvoiceStatus.PartiallyPaid;
    const updatedInvoiceData = { ...invoice, status: newStatus };
    set({ loading: true, error: null });
    try {
      const updatedInvoice = await api<Invoice>(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedInvoiceData),
      });
      set((state) => ({
        invoices: state.invoices.map((i) => (i.id === invoiceId ? updatedInvoice : i)),
        loading: false,
      }));
      return updatedInvoice;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to record payment';
      set({ loading: false, error: errorMessage });
      return null;
    }
  },
  getNextInvoiceNumber: () => {
    const invoices = get().invoices;
    if (invoices.length === 0) {
      return 'INV-001';
    }
    const lastInvoiceNumber = invoices.sort((a, b) => a.invoice_number.localeCompare(b.invoice_number))[invoices.length - 1].invoice_number;
    const lastNumber = parseInt(lastInvoiceNumber.split('-')[1], 10);
    const nextNumber = lastNumber + 1;
    return `INV-${String(nextNumber).padStart(3, '0')}`;
  },
}));