import { Insertable, Selectable } from 'kysely';

export interface Database {
  user: UserTable;
}

export interface UserTable {
  id: string;
  email: string;
  password_hash: string;
  createdAt: Date;
  updatedAt: Date;
}

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>
export type 

export interface LogTable {
  id: string;
  project_id: string;
  event: string;
  timestamp: Date;
}