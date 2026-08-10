import { Request } from 'express';

export type Role = 'Admin' | 'Sales' | 'Warehouse' | 'Accounts';

export interface AuthPayload {
  id: number;
  email: string;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}
