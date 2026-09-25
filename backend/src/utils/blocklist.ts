import { db } from '../db/connection.js';
import { revokedAccessTokens } from '../db/schema.js';
import { eq, lt } from 'drizzle-orm';

export async function revokeAccessToken(signature: string, expiresAt: Date): Promise<void> {
  if (!signature || expiresAt <= new Date()) return;
  await db.insert(revokedAccessTokens)
    .values({ signature, expires_at: expiresAt })
    .onConflictDoNothing();
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

export async function purgeExpiredAccessTokenRevocations(): Promise<void> {
  await db.delete(revokedAccessTokens).where(lt(revokedAccessTokens.expires_at, new Date()));
}
