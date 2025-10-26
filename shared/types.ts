export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export enum UserRole {
  Admin = 'Admin',
  Manager = 'Manager',
  Doctor = 'Doctor',
  Accountant = 'Accountant',
  Storekeeper = 'Storekeeper',
  Patient = 'Patient',
}
export interface User {
  id: string; // uuid
  username: string;
  email: string;
  password_hash?: string; // Should not be sent to client
  full_name: string;
  role: UserRole;
  phone?: string;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}
export interface Patient {
  id: string; // uuid
  user_id?: string; // uuid, nullable if no portal access
  full_name: string;
  dob: string; // ISO 8601 date string
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email?: string;
  emergency_contact?: {
    name: string;
    phone: string;
  };
  medical_history?: string;
  createdAt: string; // ISO 8601 date string
}
export interface Service {
  id: string; // uuid
  name: string;
  description?: string;
  category?: string;
  default_price: number; // in PKR
  estimated_duration_minutes: number;
  is_active: boolean;
}
export enum AppointmentStatus {
  Scheduled = 'Scheduled',
  CheckedIn = 'Checked-in',
  Completed = 'Completed',
  NoShow = 'No-show',
  Cancelled = 'Cancelled',
}
export interface Appointment {
  id: string; // uuid
  patient_id: string; // uuid
  doctor_user_id: string; // uuid
  service_id: string; // uuid
  start_time: string; // ISO 8601 date string
  end_time: string; // ISO 8601 date string
  status: AppointmentStatus;
  notes?: string;
}
export enum InvoiceStatus {
  Paid = 'Paid',
  Unpaid = 'Unpaid',
  PartiallyPaid = 'Partially Paid',
}
export interface InvoiceItem {
  id: string; // uuid
  invoice_id: string; // uuid
  service_id?: string; // uuid
  description: string;
  unit_price: number; // in PKR
  quantity: number;
  line_total: number; // in PKR
}
export interface Invoice {
  id: string; // uuid
  invoice_number: string;
  patient_id: string; // uuid
  created_by_user_id: string; // uuid
  total_amount: number; // in PKR
  tax: number; // in PKR
  discount: number; // in PKR
  status: InvoiceStatus;
  createdAt: string; // ISO 8601 date string
  items: InvoiceItem[];
}
export interface Payment {
  id: string; // uuid
  invoice_id: string; // uuid
  paid_by_user_id: string; // uuid
  amount: number; // in PKR
  method: 'Cash' | 'Card' | 'Bank Transfer' | 'Other';
  date: string; // ISO 8601 date string
}
export interface InventoryItem {
  id: string; // uuid
  name: string;
  sku?: string;
  unit: string; // e.g., 'piece', 'box', 'ml'
  quantity_on_hand: number;
  reorder_threshold: number;
  unit_price: number; // in PKR
  last_received_at?: string; // ISO 8601 date string
}
export interface InventoryTransaction {
  id: string; // uuid
  item_id: string; // uuid
  type: 'receive' | 'consume' | 'adjust';
  quantity: number; // can be negative for consume/adjust
  related_entity_id?: string; // e.g., appointment_id or invoice_id
  notes?: string;
  created_by_user_id: string; // uuid
  createdAt: string; // ISO 8601 date string
}
// Settings and Permissions
export type PermissionsMap = {
  [key in UserRole]?: string[]; // Array of module names
};
export interface AppSettings {
  id: string;
  permissions: PermissionsMap;
}
// Chat
export interface ChatMessage {
  id: string;
  user_id: string;
  user_full_name: string;
  text: string;
  timestamp: string; // ISO 8601 date string
}
// Activity Log for Dashboard
export interface ActivityLog {
  id: string;
  type: 'PATIENT' | 'INVOICE' | 'APPOINTMENT' | 'INVENTORY';
  description: string;
  timestamp: string; // ISO 8601 date string
}