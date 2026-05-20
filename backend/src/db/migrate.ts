import 'dotenv/config';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from './connection.js';

async function runMigrations(): Promise<void> {
  console.log('[MIGRATE] Running database migrations...');

  await migrate(db, { migrationsFolder: './drizzle' });

  console.log('[MIGRATE] Migrations completed successfully.');
  await pool.end();
  process.exit(0);
}

runMigrations().catch(async (error: unknown) => {
  console.error('[ERR_MIGRATION_FAILED] Migration failed:', error);
  await pool.end();
  process.exit(1);
});
