import { create } from 'zustand';
import { User, UserRole, PermissionsMap } from '@shared/types';
import { api } from './api-client';
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  users: User[];
  doctors: User[];
  permissions: string[]; // Permissions for the current user's role
  loading: boolean;
  error: string | null;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchUsers: () => Promise<void>;
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'password_hash'>) => Promise<User | null>;
  updateUser: (user: User) => Promise<User | null>;
  deleteUser: (userId: string) => Promise<boolean>;
}
export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  users: [],
  doctors: [],
  permissions: [],
  loading: false,
  error: null,
  login: async (identifier, password) => {
    set({ loading: true, error: null });
    try {
      const user = await api<User>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });
      set({ isAuthenticated: true, user, loading: false });
      // Fetch permissions for the user's role
      const allPermissions = await api<PermissionsMap>('/api/settings/permissions');
      const userPermissions = allPermissions[user.role] || [];
      set({ permissions: userPermissions });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      set({ isAuthenticated: false, user: null, loading: false, error: errorMessage, permissions: [] });
      return false;
    }
  },
  logout: () => {
    set({ isAuthenticated: false, user: null, permissions: [] });
  },
  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const users = await api<User[]>('/api/users');
      set({
        users,
        doctors: users.filter((u) => u.role === UserRole.Doctor),
        loading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users';
      set({ loading: false, error: errorMessage });
    }
  },
  addUser: async (newUser) => {
    set({ loading: true, error: null });
    try {
      const user = await api<User>('/api/users', {
        method: 'POST',
        body: JSON.stringify(newUser),
      });
      set((state) => ({
        users: [...state.users, user],
        doctors: user.role === UserRole.Doctor ? [...state.doctors, user] : state.doctors,
        loading: false,
      }));
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add user';
      set({ loading: false, error: errorMessage });
      return null;
    }
  },
  updateUser: async (userToUpdate) => {
    set({ loading: true, error: null });
    try {
      const updatedUser = await api<User>(`/api/users/${userToUpdate.id}`, {
        method: 'PUT',
        body: JSON.stringify(userToUpdate),
      });
      set((state) => ({
        users: state.users.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
        doctors: state.users.map((u) => (u.id === updatedUser.id ? updatedUser : u)).filter(u => u.role === UserRole.Doctor),
        loading: false,
      }));
      return updatedUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      set({ loading: false, error: errorMessage });
      return null;
    }
  },
  deleteUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      await api(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      set((state) => ({
        users: state.users.filter((u) => u.id !== userId),
        doctors: state.doctors.filter((d) => d.id !== userId),
        loading: false,
      }));
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
      set({ loading: false, error: errorMessage });
      return false;
    }
  },
}));