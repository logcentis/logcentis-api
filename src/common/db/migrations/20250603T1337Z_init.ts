import { Kysely, sql } from 'kysely';
import { Database } from '@/types/db';

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('user')
    .addColumn('id', 'uuid', (col) => col.primaryKey().notNull().defaultTo(sql`gen_random_uuid
    ()`))
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('email', 'text', (col) => col.notNull().unique())
    .addColumn('password_hash', 'text', (col) => col.notNull())
    .addColumn('createdAt', 'timestamp', (col) => col.defaultTo(sql`now
    ()`).notNull())
    .addColumn('updatedAt', 'timestamp', (col) => col.defaultTo(sql`now
    ()`).notNull())
    .execute();

  await db.schema
    .createTable('project')
    .addColumn('id', 'uuid', (col) => col.primaryKey().notNull())
    .addColumn('user_id', 'uuid', (col) => col.notNull())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('description', 'text', (col) => col.notNull())
    .addColumn('createdAt', 'timestamp', (col) => col.defaultTo(sql`now
    ()`).notNull())
    .addColumn('updatedAt', 'timestamp', (col) => col.defaultTo(sql`now
    ()`).notNull())
    .execute();

  await db.schema
    .createTable('log')
    .addColumn('id', 'uuid', (col) => col.primaryKey().notNull())
    .addColumn('project_id', 'uuid', (col) => col.notNull())
    .addColumn('level', 'text', (col) => col.notNull())
    .addColumn('message', 'text', (col) => col.notNull())
    .addColumn('context', 'jsonb')
    .addColumn('environment', 'text', (col) => col.notNull())
    .addColumn('is_handled', 'boolean', (col) => col.defaultTo(false).notNull())
    .addColumn('tags', sql`text
    []`)
    .addColumn('origin', 'text', (col) => col.notNull())
    .addColumn('timestamp', 'timestamp', (col) => col.defaultTo(sql`now
    ()`).notNull())
    .execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable('user').execute();
  await db.schema.dropTable('project').execute();
  await db.schema.dropTable('log').execute();
}