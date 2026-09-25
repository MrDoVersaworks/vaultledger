import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { users, refreshTokens } from '../db/schema.js';
import { config } from '../config/index.js';
import {
  BCRYPT_SALT_ROUNDS,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY_DAYS,
  ErrorCode
} from '../constants/index.js';
import { logger } from '../utils/logger.js';
import type {
  JwtAccessPayload,
  AuthenticatedUser
} from '../types/index.js';

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  businessName?: string;
}

interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: AuthenticatedUser;
}

interface RegisterResult {
  user: AuthenticatedUser;
}

export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existing.length > 0) {
    throw new Error(`[${ErrorCode.AUTH_EMAIL_EXISTS}] An account with this email already exists.`);
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);

  const inserted = await db
    .insert(users)
    .values({
      email: normalizedEmail,
      password_hash: passwordHash,
      name: input.name,
      business_name: input.businessName || null,
    })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      businessName: users.business_name,
      role: users.role,
    });

  if (inserted.length === 0) {
    throw new Error(`[${ErrorCode.INTERNAL_ERROR}] Failed to create user account.`);
  }

  return { user: inserted[0] };
}

export async function loginUser(email: string, password: string): Promise<LoginResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const userRows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      password_hash: users.password_hash,
      businessName: users.business_name,
      role: users.role,
    })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (userRows.length === 0) {
    throw new Error(`[${ErrorCode.AUTH_INVALID_CREDENTIALS}] Invalid email or password.`);
  }

  const user = userRows[0];
  const passwordValid = await bcrypt.compare(password, user.password_hash);

  if (!passwordValid) {
    throw new Error(`[${ErrorCode.AUTH_INVALID_CREDENTIALS}] Invalid email or password.`);
  }

  const accessPayload: JwtAccessPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
  };
  const accessToken = jwt.sign(accessPayload, config.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

  const rawRefreshToken = crypto.randomBytes(40).toString('hex');
  const refreshTokenHash = await bcrypt.hash(rawRefreshToken, BCRYPT_SALT_ROUNDS);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  const insertedTokens = await db
    .insert(refreshTokens)
    .values({
      user_id: user.id,
      token_hash: refreshTokenHash,
      expires_at: expiresAt,
    })
    .returning({ id: refreshTokens.id });

  if (insertedTokens.length === 0) {
    throw new Error(`[${ErrorCode.INTERNAL_ERROR}] Failed to create refresh token.`);
  }

  const refreshToken = `${insertedTokens[0].id}.${rawRefreshToken}`;

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      businessName: user.businessName,
      role: user.role,
    },
  };
}

export async function refreshAccessToken(refreshTokenValue: string): Promise<LoginResult> {
  const dotIndex = refreshTokenValue.indexOf('.');
  if (dotIndex === -1) throw new Error('[' + ErrorCode.AUTH_REFRESH_FAILED + '] Invalid refresh token format.');

  const tokenId = refreshTokenValue.substring(0, dotIndex);
  const rawToken = refreshTokenValue.substring(dotIndex + 1);

  return db.transaction(async (tx) => {
    const tokenRows = await tx.select().from(refreshTokens).where(eq(refreshTokens.id, tokenId)).limit(1);
    if (tokenRows.length === 0) throw new Error('[' + ErrorCode.AUTH_REFRESH_FAILED + '] Refresh token not found.');

    const storedToken = tokenRows[0];
    if (new Date() > storedToken.expires_at) {
      await tx.delete(refreshTokens).where(eq(refreshTokens.id, tokenId));
      throw new Error('[' + ErrorCode.AUTH_REFRESH_FAILED + '] Refresh token has expired.');
    }
    if (!await bcrypt.compare(rawToken, storedToken.token_hash)) {
      throw new Error('[' + ErrorCode.AUTH_REFRESH_FAILED + '] Invalid refresh token.');
    }

    const userRows = await tx.select({
      id: users.id, email: users.email, name: users.name,
      businessName: users.business_name, role: users.role,
    }).from(users).where(eq(users.id, storedToken.user_id)).limit(1);
    if (userRows.length === 0) throw new Error('[' + ErrorCode.AUTH_REFRESH_FAILED + '] User not found.');

    const user = userRows[0];
    const accessToken = jwt.sign({
      userId: user.id, email: user.email, name: user.name,
    } as JwtAccessPayload, config.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });

    const newRawRefreshToken = crypto.randomBytes(40).toString('hex');
    const newRefreshTokenHash = await bcrypt.hash(newRawRefreshToken, BCRYPT_SALT_ROUNDS);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await tx.delete(refreshTokens).where(eq(refreshTokens.id, tokenId));
    const insertedTokens = await tx.insert(refreshTokens).values({
      user_id: user.id, token_hash: newRefreshTokenHash, expires_at: expiresAt,
    }).returning({ id: refreshTokens.id });
    if (insertedTokens.length === 0) throw new Error('[' + ErrorCode.INTERNAL_ERROR + '] Failed to rotate refresh token.');

    return {
      accessToken,
      refreshToken: insertedTokens[0].id + '.' + newRawRefreshToken,
      user: { id: user.id, email: user.email, name: user.name, businessName: user.businessName, role: user.role },
    };
  });
}

export async function logoutUser(refreshTokenValue: string): Promise<void> {
  const dotIndex = refreshTokenValue.indexOf('.');
  if (dotIndex === -1) {
    return;
  }

  const tokenId = refreshTokenValue.substring(0, dotIndex);
  await db.delete(refreshTokens).where(eq(refreshTokens.id, tokenId));
  logger.info('AUTH', `Refresh token invalidated: ${tokenId}`);
}

export async function deleteUserAccount(userId: string, password: string): Promise<void> {
  const userRows = await db
    .select({ id: users.id, password_hash: users.password_hash })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (userRows.length === 0) {
    throw new Error(`[${ErrorCode.AUTH_INVALID_CREDENTIALS}] User not found.`);
  }

  const user = userRows[0];
  const passwordValid = await bcrypt.compare(password, user.password_hash);

  if (!passwordValid) {
    throw new Error(`[${ErrorCode.AUTH_PASSWORD_MISMATCH}] Incorrect password. Account deletion requires password confirmation.`);
  }

  // Delete user - ON DELETE CASCADE clears refresh_tokens, clients, invoices, expenses automatically
  await db.delete(users).where(eq(users.id, userId));

  logger.info('AUTH', `Account deleted for user: ${userId}.`);
}
