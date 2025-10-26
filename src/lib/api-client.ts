import { ApiResponse } from "../../shared/types"
import { useAuthStore } from "./auth";
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const user = useAuthStore.getState().user;
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  if (user) {
    headers.set('Authorization', `Bearer ${user.id}`);
  }
  const res = await fetch(path, { ...init, headers });
  if (res.status === 204) { // No Content
    return null as T;
  }
  const json = (await res.json()) as ApiResponse<T>;
  if (!res.ok || !json.success || json.data === undefined) {
    throw new Error(json.error || 'Request failed');
  }
  return json.data;
}