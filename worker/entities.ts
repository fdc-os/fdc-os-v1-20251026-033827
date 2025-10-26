import { IndexedEntity, Entity } from './core-utils';
import { User, Patient, Service, Appointment, Invoice, InventoryItem, UserRole, AppointmentStatus, InvoiceStatus, AppSettings, ChatMessage } from '@shared/types';
import type { Env } from './core-utils';
const ADMIN_PASSWORD_HASH = "hashed_password_for_admin";
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = 'user';
  static readonly indexName = 'users';
  static readonly initialState: User = {
    id: '',
    username: '',
    email: '',
    password_hash: '',
    full_name: '',
    role: UserRole.Patient,
    createdAt: '',
    updatedAt: ''
  };
  static readonly seedData: ReadonlyArray<User> = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@dentalflow.com',
      password_hash: ADMIN_PASSWORD_HASH,
      full_name: 'Dr. Admin',
      role: UserRole.Admin,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      username: 'doctor',
      email: 'doctor@dentalflow.com',
      password_hash: 'hashed_password_for_doctor',
      full_name: 'Dr. Smith',
      role: UserRole.Doctor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      username: 'manager',
      email: 'manager@dentalflow.com',
      password_hash: 'hashed_password_for_manager',
      full_name: 'Jane Doe',
      role: UserRole.Manager,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'patient-user-1',
      username: 'patient_asma',
      email: 'asma@testmail.com',
      password_hash: 'hashed_password_for_patient_asma',
      full_name: 'Asma Bibi',
      role: UserRole.Patient,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}
export class PatientEntity extends IndexedEntity<Patient> {
  static readonly entityName = 'patient';
  static readonly indexName = 'patients';
  static readonly initialState: Patient = {
    id: '',
    full_name: '',
    dob: '',
    gender: 'Other',
    phone: '',
    createdAt: ''
  };
  static readonly seedData: ReadonlyArray<Patient> = [
    {
      id: 'patient-1',
      user_id: 'patient-user-1',
      full_name: 'Asma Bibi',
      dob: '1992-05-12',
      gender: 'Female',
      phone: '03001234567',
      email: 'asma@testmail.com',
      medical_history: 'None',
      createdAt: new Date().toISOString()
    }
  ];
}
export class ServiceEntity extends IndexedEntity<Service> {
  static readonly entityName = 'service';
  static readonly indexName = 'services';
  static readonly initialState: Service = {
    id: '',
    name: '',
    default_price: 0,
    estimated_duration_minutes: 0,
    is_active: true
  };
}
export class AppointmentEntity extends IndexedEntity<Appointment> {
  static readonly entityName = 'appointment';
  static readonly indexName = 'appointments';
  static readonly initialState: Appointment = {
    id: '',
    patient_id: '',
    doctor_user_id: '',
    service_id: '',
    start_time: '',
    end_time: '',
    status: AppointmentStatus.Scheduled
  };
}
export class InvoiceEntity extends IndexedEntity<Invoice> {
  static readonly entityName = 'invoice';
  static readonly indexName = 'invoices';
  static readonly initialState: Invoice = {
    id: '',
    invoice_number: '',
    patient_id: '',
    created_by_user_id: '',
    total_amount: 0,
    tax: 0,
    discount: 0,
    status: InvoiceStatus.Unpaid,
    createdAt: '',
    items: []
  };
}
export class InventoryItemEntity extends IndexedEntity<InventoryItem> {
  static readonly entityName = 'inventoryItem';
  static readonly indexName = 'inventoryItems';
  static readonly initialState: InventoryItem = {
    id: '',
    name: '',
    unit: '',
    quantity_on_hand: 0,
    reorder_threshold: 0,
    unit_price: 0
  };
}
export class SettingsEntity extends Entity<AppSettings> {
  static readonly entityName = 'settings';
  static readonly SINGLETON_ID = 'global-settings';
  static readonly initialState: AppSettings = {
    id: SettingsEntity.SINGLETON_ID,
    permissions: {
      [UserRole.Admin]: ['Dashboard', 'Appointments', 'Patients', 'Staff', 'Services', 'Invoices', 'Inventory', 'Reports', 'Settings'],
      [UserRole.Manager]: ['Dashboard', 'Appointments', 'Patients', 'Services', 'Invoices', 'Inventory', 'Reports', 'Settings'],
      [UserRole.Doctor]: ['Dashboard', 'Appointments', 'Patients', 'Settings'],
      [UserRole.Accountant]: ['Dashboard', 'Invoices', 'Reports', 'Settings'],
      [UserRole.Storekeeper]: ['Dashboard', 'Inventory', 'Settings'],
      [UserRole.Patient]: ['Portal', 'Settings']
    }
  };
  constructor(env: Env) {
    super(env, SettingsEntity.SINGLETON_ID);
  }
  static async get(env: Env): Promise<SettingsEntity> {
    const settings = new SettingsEntity(env);
    if (!(await settings.exists())) {
      await settings.save(SettingsEntity.initialState);
    }
    return settings;
  }
}
export class ChatEntity extends Entity<{ messages: ChatMessage[] }> {
  static readonly entityName = 'chat';
  static readonly SINGLETON_ID = 'global-chat';
  static readonly initialState = { messages: [] };
  constructor(env: Env) {
    super(env, ChatEntity.SINGLETON_ID);
  }
  static async get(env: Env): Promise<ChatEntity> {
    const chat = new ChatEntity(env);
    if (!(await chat.exists())) {
      await chat.save(ChatEntity.initialState);
    }
    return chat;
  }
  async addMessage(message: ChatMessage): Promise<void> {
    await this.mutate(state => ({
      messages: [...state.messages, message].slice(-100) // Keep last 100 messages
    }));
  }
}