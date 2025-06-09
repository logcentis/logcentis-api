import logger from '@/common/utils/logger';

const [, , ...args]: string[] = process.argv;

// args.forEach(arg => {
//   if (arg.startsWith('--') && arg.length > 2) {
//     argsSet.push([arg]);
//   } else {
//     argsSet[argsSet.length - 1].push(arg);
//   }
// });
//
// if (args[0] === '--migrate:latest') {
//   import('@/common/db/migrate')
//     .then(({ migrateToLatest }) => migrateToLatest())
//     .catch((error) => {
//       logger.error('Migration to latest failed:', error);
//       process.exit(1);
//     });
// }

const options = {
  help: {
    description: 'Display this help message',
    usage: '--help',
  },
  migrateLatest: {
    description: 'Migrate database to the latest version',
    usage: '--migrate:latest',
  },
  migrateDown: {
    description: 'Rollback the last migration',
    usage: '--migrate:down',
  },
  migrateUp: {
    description: 'Run the next migration',
    usage: '--migrate:up',
  },
  migrateTo: {
    description: 'Migrate database to a specific version',
    usage: '--migrate:to <version>',
  },
  migrateStatus: {
    description: 'Get the current migration status',
    usage: '--migrate:status',
  },
  migrateCurrent: {
    description: 'Display the current version of the application',
    usage: '--migrate:current',
  },
  createModule: {
    description: 'Create a new module',
    usage: '--create:module <name>',
  },
};

switch (args[0]) {
  case options.help.usage:
    for (const option of Object.values(options)) {
      console.log(`${option.usage}: ${option.description}`);
    }
    break;

  case options.migrateLatest.usage:
    import('@/common/db/migrator')
      .then(({ migrateToLatest }) => migrateToLatest())
      .catch((error) => {
        logger.error('Migration to latest failed:', error);
        process.exit(1);
      });
    break;

  case options.migrateDown.usage:
    import('@/common/db/migrator')
      .then(({ migrateDown }) => migrateDown())
      .catch((error) => {
        logger.error('Rollback of last migration failed:', error);
        process.exit(1);
      });
    break;

  case options.migrateUp.usage:
    import('@/common/db/migrator')
      .then(({ migrateUp }) => migrateUp())
      .catch((error) => {
        logger.error('Migration failed:', error);
        process.exit(1);
      });
    break;

  case options.migrateTo.usage.split(' ')[0]:
    import('@/common/db/migrator')
      .then(({ migrateToVersion }) => {
        if (args[1]) {
          return migrateToVersion(args[1]);
        }
        logger.error('No version specified for migration down');
        process.exit(1);
      })
      .catch((error) => {
        logger.error(`Migration to ${args[1]} failed:`, error);
        process.exit(1);
      });
    break;

  case options.migrateStatus.usage:
    import('@/common/db/migrator')
      .then(({ getMigrationStatus }) => getMigrationStatus())
      .catch((error) => {
        logger.error('Failed to get migration status:', error);
        process.exit(1);
      });
    break;

  case options.migrateCurrent.usage:
    import('@/common/db/migrator')
      .then(({ getCurrentMigration }) => getCurrentMigration())
      .catch((error) => {
        logger.error('Failed to get current version:', error);
        process.exit(1);
      });
    break;

  case options.createModule.usage.split(' ')[0]:
    if (args[1]) {
      import('./functions/createModule')
        .then(({ createModule }) => createModule(args[1]))
        .catch((error) => {
          logger.error(`Failed to create module ${args[1]}:`, error);
          process.exit(1);
        });
    } else {
      logger.error('No module name specified for creation');
      process.exit(1);
    }
    break;

  default:
    logger.info('No valid command provided. Use --help for options.');
    process.exit(0);
}
