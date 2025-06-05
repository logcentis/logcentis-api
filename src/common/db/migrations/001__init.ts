import { DB } from '@/types/db';
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema
    .createTable('user')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().notNull().defaultTo(sql`gen_random_uuid
    ()`)
    )
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('email', 'text', (col) => col.notNull().unique())
    .addColumn('password_hash', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col
        .defaultTo(
          sql`now
    ()`
        )
        .notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col
        .defaultTo(
          sql`now
    ()`
        )
        .notNull()
    )
    .execute();

  await db.schema
    .createType('session_status')
    .asEnum(['active', 'inactive'])
    .execute();

  await db.schema
    .createTable('session')
    .addColumn('id', 'uuid', (col) =>
      col
        .primaryKey()
        .notNull()
        .defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('user_id', 'uuid', (col) => col.notNull())
    .addColumn('auth_token', 'text', (col) => col.notNull().unique())
    .addColumn('refresh_token', 'text', (col) => col.notNull().unique())
    .addColumn('user_agent', 'text', (col) => col.notNull())
    .addColumn('ip_address', 'text', (col) => col.notNull())
    .addColumn('status', sql`session_status`, (col) =>
      col.defaultTo('active').notNull()
    )
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('expires_at', 'timestamp', (col) => col.notNull())
    .addForeignKeyConstraint(
      'session_user_id_fkey',
      ['user_id'],
      'user',
      ['id'],
      (fk) => fk.onDelete('cascade')
    )
    .execute();

  await db.schema
    .createTable('project')
    .addColumn('id', 'uuid', (col) => col.primaryKey().notNull())
    .addColumn('user_id', 'uuid', (col) => col.notNull())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('description', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col
        .defaultTo(
          sql`now
    ()`
        )
        .notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col
        .defaultTo(
          sql`now
    ()`
        )
        .notNull()
    )
    .addForeignKeyConstraint(
      'project_user_id_fkey',
      ['user_id'],
      'user',
      ['id'],
      (fk) => fk.onDelete('cascade')
    )
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
    .addColumn(
      'tags',
      sql`text
    []`
    )
    .addColumn('origin', 'text', (col) => col.notNull())
    .addColumn('timestamp', 'timestamp', (col) =>
      col
        .defaultTo(
          sql`now
    ()`
        )
        .notNull()
    )
    .addForeignKeyConstraint(
      'log_project_id_fkey',
      ['project_id'],
      'project',
      ['id'],
      (fk) => fk.onDelete('cascade')
    )
    .execute();
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.schema.dropTable('user').execute();
  await db.schema.dropTable('session').execute();
  await db.schema.dropType('session_status').execute();
  await db.schema.dropTable('project').execute();
  await db.schema.dropTable('log').execute();
}
