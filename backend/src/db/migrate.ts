import 'dotenv/config';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from './connection.js';
import { eq } from 'drizzle-orm';
import { users } from './schema.js';
import { config } from '../config/index.js';

async function runMigrations(): Promise<void> {
  console.log('[MIGRATE] Running database migrations...');

  await migrate(db, { migrationsFolder: './drizzle' });
  if (config.ADMIN_EMAIL) {
    await db.update(users).set({ role: 'admin' }).where(eq(users.email, config.ADMIN_EMAIL.trim().toLowerCase()));
  }

  console.log('[MIGRATE] Migrations completed successfully.');
  await pool.end();
  process.exit(0);
}

runMigrations().catch(async (error: unknown) => {
  console.error('[ERR_MIGRATION_FAILED] Migration failed:', error);
  await pool.end();
  process.exit(1);
});
