import * as path from 'path';
import { promises as fs } from 'fs';
import { FileMigrationProvider, MigrationInfo, Migrator } from 'kysely';
import db from '@/common/db';
import logger from '@/common/utils/logger';

const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: path.join(__dirname, 'migrations'),
  }),
});

export async function migrateToLatest() {
  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`✔ migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === 'Error') {
      console.log(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    logger.error(error);
    throw new Error('Migration failed');
  }

  await db.destroy();
}

export async function migrateDown() {
  const { error, results } = await migrator.migrateDown();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`✔ migration "${it.migrationName}" was rolled back successfully`);
    } else if (it.status === 'Error') {
      logger.error(`failed to roll back migration "${it.migrationName}"`);
    }
  });

  if (error) {
    logger.error(error);
    throw new Error('Migration down failed');
  }

  await db.destroy();
}

export async function migrateUp() {
  const { error, results } = await migrator.migrateUp();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`✔ migration "${it.migrationName}" was applied successfully`);
    } else if (it.status === 'Error') {
      logger.error(`failed to apply migration "${it.migrationName}"`);
    }
  });

  if (error) {
    logger.error(error);
    throw new Error('Migration up failed');
  }

  await db.destroy();
}

export async function migrateToVersion(version: string) {
  const { error, results } = await migrator.migrateTo(version);

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`✔ migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === 'Error') {
      logger.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    logger.error(error);
    throw new Error(`Migration to version ${version} failed`);
  }

  await db.destroy();
}

export async function getMigrationStatus() {
  const migrations = await migrator.getMigrations();

  migrations.forEach((migration) => {
    console.log({
      migrationName: migration.name,
      status: migration.executedAt ? 'Executed' : 'Pending',
      executedAt: migration.executedAt ? migration.executedAt.toISOString() : 'Not executed',
    });
  });

  await db.destroy();
}

export async function getCurrentMigration() {
  const migrations = await migrator.getMigrations();
  let lastExecutedMigration: MigrationInfo | null = null;

  for (const migration of migrations) {
    if (migration.executedAt) {
      lastExecutedMigration = migration;
      continue;
    }
    break;
  }

  await db.destroy();

  if (lastExecutedMigration) {
    console.log(`Current migration: ${lastExecutedMigration.name}`);
    return lastExecutedMigration.name;
  } else {
    console.log('No migrations have been executed yet.');
    return null;
  }
}
