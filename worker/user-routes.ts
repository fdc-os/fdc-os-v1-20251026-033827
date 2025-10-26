import { Hono } from "hono";
import { v4 as uuidv4 } from 'uuid';
import type { Env } from './core-utils';
import { ok, bad, notFound, isStr, IndexedEntity } from './core-utils';
import { UserEntity, PatientEntity, ServiceEntity, AppointmentEntity, InvoiceEntity, InventoryItemEntity, SettingsEntity, ChatEntity } from './entities';
import { User, Patient, Service, Appointment, Invoice, InventoryItem, UserRole, AppSettings, ChatMessage } from '@shared/types';
type IndexedEntityCtor<T extends { id: string }> = (Omit<typeof IndexedEntity, 'new' | 'prototype'> & { new(env: Env, id: string): IndexedEntity<T> });
export function userRoutes(app: Hono<{ Bindings: Env; Variables: { user: User } }>) {
  app.use('*', async (c, next) => {
    await UserEntity.ensureSeed(c.env);
    await PatientEntity.ensureSeed(c.env);
    await next();
  });
  // --- AUTH ---
  app.post('/api/auth/login', async (c) => {
    const { identifier, password } = await c.req.json();
    if (!isStr(identifier) || !isStr(password)) return bad(c, 'Identifier and password required');
    const { items: allUsers } = await UserEntity.list(c.env);
    const user = allUsers.find((u) => u.username === identifier || u.email === identifier);
    if (!user || user.password_hash !== `hashed_password_for_${user.username}`) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }
    const { password_hash, ...userClientData } = user;
    return ok(c, userClientData);
  });
  // --- RBAC MIDDLEWARE ---
  app.use('/api/*', async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    const userId = authHeader.substring(7);
    const userEntity = new UserEntity(c.env, userId);
    if (!(await userEntity.exists())) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    const user = await userEntity.getState();
    c.set('user', user);
    await next();
  });
  // --- SETTINGS ---
  app.get('/api/settings/permissions', async (c) => {
    const settings = await SettingsEntity.get(c.env);
    const state = await settings.getState();
    return ok(c, state.permissions);
  });
  app.post('/api/settings/permissions', async (c) => {
    const user = c.get('user');
    if (user.role !== UserRole.Admin) {
      return c.json({ success: false, error: 'Forbidden' }, 403);
    }
    const permissions = await c.req.json<AppSettings['permissions']>();
    const settings = await SettingsEntity.get(c.env);
    await settings.patch({ permissions });
    return ok(c, permissions);
  });
  // --- CHAT ---
  app.get('/api/chat/messages', async (c) => {
    const user = c.get('user');
    if (user.role === UserRole.Patient) return c.json({ success: false, error: 'Forbidden' }, 403);
    const chat = await ChatEntity.get(c.env);
    const state = await chat.getState();
    return ok(c, state.messages);
  });
  app.post('/api/chat/messages', async (c) => {
    const user = c.get('user');
    if (user.role === UserRole.Patient) return c.json({ success: false, error: 'Forbidden' }, 403);
    const { text } = await c.req.json<{ text: string }>();
    if (!isStr(text)) return bad(c, 'Message text is required');
    const message: ChatMessage = {
      id: uuidv4(),
      user_id: user.id,
      user_full_name: user.full_name,
      text,
      timestamp: new Date().toISOString(),
    };
    const chat = await ChatEntity.get(c.env);
    await chat.addMessage(message);
    return ok(c, message);
  });
  // --- USERS (STAFF) ---
  app.get('/api/users', async (c) => {
    const { items } = await UserEntity.list(c.env);
    const clientUsers = items.map((u) => {
      const { password_hash, ...rest } = u;
      return rest;
    });
    return ok(c, clientUsers);
  });
  app.post('/api/users', async (c) => {
    const userData = await c.req.json<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>();
    if (!isStr(userData.username) || !isStr(userData.email) || !isStr(userData.full_name)) {
      return bad(c, 'Missing required user fields');
    }
    const newUser: User = {
      ...userData,
      id: uuidv4(),
      password_hash: `hashed_password_for_${userData.username}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await UserEntity.create(c.env, newUser);
    const { password_hash, ...clientUser } = newUser;
    return ok(c, clientUser);
  });
  app.put('/api/users/:id', async (c) => {
      const { id } = c.req.param();
      const data = await c.req.json<User>();
      const entity = new UserEntity(c.env, id);
      if (!(await entity.exists())) return notFound(c);
      const currentState = await entity.getState();
      const updatedState = { ...currentState, ...data, updatedAt: new Date().toISOString() };
      if (!data.password_hash) {
        updatedState.password_hash = currentState.password_hash;
      }
      await entity.save(updatedState);
      const { password_hash, ...clientUser } = updatedState;
      return ok(c, clientUser);
  });
  app.delete('/api/users/:id', async (c) => {
      const { id } = c.req.param();
      const deleted = await UserEntity.delete(c.env, id);
      if (!deleted) return notFound(c);
      return ok(c, { id });
  });
  // --- INVENTORY STOCK ADJUSTMENT ---
  app.put('/api/inventory/:id/stock', async (c) => {
    const { id } = c.req.param();
    const { quantity } = await c.req.json<{ quantity: number }>();
    if (typeof quantity !== 'number') return bad(c, 'Quantity must be a number');
    const itemEntity = new InventoryItemEntity(c.env, id);
    if (!(await itemEntity.exists())) return notFound(c);
    const updatedItem = await itemEntity.mutate(item => ({
      ...item,
      quantity_on_hand: quantity,
    }));
    return ok(c, updatedItem);
  });
  // --- GENERIC CRUD HELPERS ---
  const createCrudRoutes = <T extends { id: string }>(
    path: string,
    EntityCtor: IndexedEntityCtor<T>
  ) => {
    app.get(`/api/${path}`, async (c) => {
      const user = c.get('user');
      const { items } = await EntityCtor.list(c.env);
      if (path === 'patients' && user.role === UserRole.Patient) {
        const userPatient = items.find(p => (p as unknown as Patient).user_id === user.id);
        return ok(c, userPatient ? [userPatient] : []);
      }
      if (path === 'appointments' && user.role === UserRole.Patient) {
        const userPatient = (await PatientEntity.list(c.env)).items.find(p => p.user_id === user.id);
        if (!userPatient) return ok(c, []);
        const userAppointments = items.filter(a => (a as unknown as Appointment).patient_id === userPatient.id);
        return ok(c, userAppointments);
      }
      if (path === 'invoices' && user.role === UserRole.Patient) {
        const userPatient = (await PatientEntity.list(c.env)).items.find(p => p.user_id === user.id);
        if (!userPatient) return ok(c, []);
        const userInvoices = items.filter(i => (i as unknown as Invoice).patient_id === userPatient.id);
        return ok(c, userInvoices);
      }
      return ok(c, items);
    });
    app.post(`/api/${path}`, async (c) => {
      const data = await c.req.json<Omit<T, 'id'>>();
      const newItem = { ...data, id: uuidv4() } as T;
      if ('createdAt' in newItem && typeof (newItem as any).createdAt === 'undefined') {
        (newItem as any).createdAt = new Date().toISOString();
      }
      if ('updatedAt' in newItem) {
        (newItem as any).updatedAt = new Date().toISOString();
      }
      await EntityCtor.create(c.env, newItem);
      return ok(c, newItem);
    });
    app.get(`/api/${path}/:id`, async (c) => {
      const { id } = c.req.param();
      const entity = new EntityCtor(c.env, id);
      if (!(await entity.exists())) return notFound(c);
      return ok(c, await entity.getState());
    });
    app.put(`/api/${path}/:id`, async (c) => {
      const { id } = c.req.param();
      const data = await c.req.json<T>();
      const entity = new EntityCtor(c.env, id);
      if (!(await entity.exists())) return notFound(c);
      const currentState = await entity.getState();
      const updatedState = { ...currentState, ...data };
      if ('updatedAt' in updatedState) {
        (updatedState as any).updatedAt = new Date().toISOString();
      }
      await entity.save(updatedState);
      return ok(c, updatedState);
    });
    app.delete(`/api/${path}/:id`, async (c) => {
      const { id } = c.req.param();
      const deleted = await EntityCtor.delete(c.env, id);
      if (!deleted) return notFound(c);
      return ok(c, { id });
    });
  };
  // --- ENTITY ROUTES ---
  createCrudRoutes<Patient>('patients', PatientEntity);
  createCrudRoutes<Service>('services', ServiceEntity);
  createCrudRoutes<Appointment>('appointments', AppointmentEntity);
  createCrudRoutes<Invoice>('invoices', InvoiceEntity);
  createCrudRoutes<InventoryItem>('inventory', InventoryItemEntity);
}