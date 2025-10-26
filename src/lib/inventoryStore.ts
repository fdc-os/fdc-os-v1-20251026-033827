import { create } from 'zustand';
import { InventoryItem } from '@shared/types';
import { api } from './api-client';
interface InventoryState {
  inventoryItems: InventoryItem[];
  loading: boolean;
  error: string | null;
  fetchInventoryItems: () => Promise<void>;
  addItem: (item: Omit<InventoryItem, 'id'>) => Promise<InventoryItem | null>;
  updateItem: (item: InventoryItem) => Promise<InventoryItem | null>;
  deleteItem: (itemId: string) => Promise<boolean>;
  adjustStock: (itemId: string, newQuantity: number) => Promise<InventoryItem | null>;
}
export const useInventoryStore = create<InventoryState>((set) => ({
  inventoryItems: [],
  loading: false,
  error: null,
  fetchInventoryItems: async () => {
    set({ loading: true, error: null });
    try {
      const inventoryItems = await api<InventoryItem[]>('/api/inventory');
      set({ inventoryItems, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch inventory items';
      set({ loading: false, error: errorMessage });
    }
  },
  addItem: async (newItemData) => {
    set({ loading: true, error: null });
    try {
      const item = await api<InventoryItem>('/api/inventory', {
        method: 'POST',
        body: JSON.stringify(newItemData),
      });
      set((state) => ({
        inventoryItems: [...state.inventoryItems, item],
        loading: false,
      }));
      return item;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add item';
      set({ loading: false, error: errorMessage });
      return null;
    }
  },
  updateItem: async (itemToUpdate) => {
    set({ loading: true, error: null });
    try {
      const updatedItem = await api<InventoryItem>(`/api/inventory/${itemToUpdate.id}`, {
        method: 'PUT',
        body: JSON.stringify(itemToUpdate),
      });
      set((state) => ({
        inventoryItems: state.inventoryItems.map((i) => (i.id === updatedItem.id ? updatedItem : i)),
        loading: false,
      }));
      return updatedItem;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update item';
      set({ loading: false, error: errorMessage });
      return null;
    }
  },
  deleteItem: async (itemId) => {
    set({ loading: true, error: null });
    try {
      await api(`/api/inventory/${itemId}`, {
        method: 'DELETE',
      });
      set((state) => ({
        inventoryItems: state.inventoryItems.filter((i) => i.id !== itemId),
        loading: false,
      }));
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete item';
      set({ loading: false, error: errorMessage });
      return false;
    }
  },
  adjustStock: async (itemId, quantity) => {
    set({ loading: true, error: null });
    try {
      const updatedItem = await api<InventoryItem>(`/api/inventory/${itemId}/stock`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });
      set((state) => ({
        inventoryItems: state.inventoryItems.map((i) => (i.id === updatedItem.id ? updatedItem : i)),
        loading: false,
      }));
      return updatedItem;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to adjust stock';
      set({ loading: false, error: errorMessage });
      return null;
    }
  },
}));