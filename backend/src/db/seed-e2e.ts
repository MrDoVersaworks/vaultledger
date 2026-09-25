import 'dotenv/config';
import { db, pool } from './connection.js';
import { users } from './schema.js';
import { config } from '../config/index.js';

const email = config.ADMIN_EMAIL ?? 'admin@example.com';
const passwordHash = process.env.E2E_ADMIN_PASSWORD_HASH ?? '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

await db.insert(users).values({
  email: email.trim().toLowerCase(),
  password_hash: passwordHash,
  name: 'E2E Administrator',
  role: 'admin',
}).onConflictDoUpdate({
  target: users.email,
  set: { role: 'admin' },
});

await pool.end();
