import { create } from 'zustand';
import { Service } from '@shared/types';
import { api } from './api-client';
interface ServiceState {
  services: Service[];
  loading: boolean;
  error: string | null;
  fetchServices: () => Promise<void>;
  addService: (service: Omit<Service, 'id'>) => Promise<Service | null>;
  updateService: (service: Service) => Promise<Service | null>;
  deleteService: (serviceId: string) => Promise<boolean>;
}
export const useServiceStore = create<ServiceState>((set) => ({
  services: [],
  loading: false,
  error: null,
  fetchServices: async () => {
    set({ loading: true, error: null });
    try {
      const services = await api<Service[]>('/api/services');
      set({ services, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch services';
      set({ loading: false, error: errorMessage });
    }
  },
  addService: async (newServiceData) => {
    set({ loading: true, error: null });
    try {
      const service = await api<Service>('/api/services', {
        method: 'POST',
        body: JSON.stringify(newServiceData),
      });
      set((state) => ({
        services: [...state.services, service],
        loading: false,
      }));
      return service;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add service';
      set({ loading: false, error: errorMessage });
      return null;
    }
  },
  updateService: async (serviceToUpdate) => {
    set({ loading: true, error: null });
    try {
      const updatedService = await api<Service>(`/api/services/${serviceToUpdate.id}`, {
        method: 'PUT',
        body: JSON.stringify(serviceToUpdate),
      });
      set((state) => ({
        services: state.services.map((s) => (s.id === updatedService.id ? updatedService : s)),
        loading: false,
      }));
      return updatedService;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update service';
      set({ loading: false, error: errorMessage });
      return null;
    }
  },
  deleteService: async (serviceId) => {
    set({ loading: true, error: null });
    try {
      await api(`/api/services/${serviceId}`, {
        method: 'DELETE',
      });
      set((state) => ({
        services: state.services.filter((s) => s.id !== serviceId),
        loading: false,
      }));
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete service';
      set({ loading: false, error: errorMessage });
      return false;
    }
  },
}));