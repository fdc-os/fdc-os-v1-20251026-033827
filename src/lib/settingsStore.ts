import { create } from 'zustand';
import { PermissionsMap } from '@shared/types';
import { api } from './api-client';
interface SettingsState {
  permissions: PermissionsMap;
  loading: boolean;
  error: string | null;
  fetchPermissions: () => Promise<void>;
  updatePermissions: (permissions: PermissionsMap) => Promise<boolean>;
}
export const useSettingsStore = create<SettingsState>((set) => ({
  permissions: {},
  loading: false,
  error: null,
  fetchPermissions: async () => {
    set({ loading: true, error: null });
    try {
      const permissions = await api<PermissionsMap>('/api/settings/permissions');
      set({ permissions, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch permissions';
      set({ loading: false, error: errorMessage });
    }
  },
  updatePermissions: async (newPermissions) => {
    set({ loading: true, error: null });
    try {
      const updatedPermissions = await api<PermissionsMap>('/api/settings/permissions', {
        method: 'POST',
        body: JSON.stringify(newPermissions),
      });
      set({ permissions: updatedPermissions, loading: false });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update permissions';
      set({ loading: false, error: errorMessage });
      return false;
    }
  },
}));