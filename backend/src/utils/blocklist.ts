import jwt from 'jsonwebtoken';
import { db } from '../db/connection.js';
import { revokedAccessTokens } from '../db/schema.js';
import { eq, lt } from 'drizzle-orm';

function decodeRevocation(token: string): { signature: string; expiresAt: Date } | null {
  const parts = token.split('.');
  if (parts.length !== 3 || !parts[2]) return null;
  const decoded = jwt.decode(token);
  if (!decoded || typeof decoded !== 'object' || typeof decoded.exp !== 'number') return null;
  const expiresAt = new Date(decoded.exp * 1000);
  if (expiresAt <= new Date()) return null;
  return { signature: parts[2], expiresAt };
}

export async function revokeAccessToken(token: string): Promise<void> {
  const record = decodeRevocation(token);
  if (!record) return;

  await db.insert(revokedAccessTokens)
    .values({ signature: record.signature, expires_at: record.expiresAt })
    .onConflictDoNothing();

  await purgeExpiredAccessTokenRevocations();
}

export async function isAccessTokenRevoked(signature: string): Promise<boolean> {
  if (!signature) return false;
  const [revoked] = await db
    .select({ signature: revokedAccessTokens.signature })
    .from(revokedAccessTokens)
    .where(eq(revokedAccessTokens.signature, signature))
    .limit(1);
  return Boolean(revoked);
}

