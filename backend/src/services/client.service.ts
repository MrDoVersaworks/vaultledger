import { eq, and } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { clients } from '../db/schema.js';
import { ErrorCode } from '../constants/index.js';
import { logger } from '../utils/logger.js';
import type { ClientResponse } from '../types/index.js';

interface CreateClientInput {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

interface UpdateClientInput {
  name?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

function mapToClientResponse(row: typeof clients.$inferSelect): ClientResponse {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    createdAt: row.created_at.toISOString(),
  };
}

export async function getClients(userId: string): Promise<ClientResponse[]> {
  const rows = await db
    .select()
    .from(clients)
    .where(eq(clients.user_id, userId));

  return rows.map(mapToClientResponse);
}

export async function getClientById(userId: string, clientId: string): Promise<ClientResponse> {
  const rows = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, clientId), eq(clients.user_id, userId)))
    .limit(1);

  if (rows.length === 0) {
    throw new Error(`[${ErrorCode.CLIENT_NOT_FOUND}] Client not found.`);
  }

  return mapToClientResponse(rows[0]);
}

export async function createClient(userId: string, input: CreateClientInput): Promise<ClientResponse> {
  const inserted = await db
    .insert(clients)
    .values({
      user_id: userId,
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      address: input.address || null,
    })
    .returning();

  if (inserted.length === 0) {
    throw new Error(`[${ErrorCode.INTERNAL_ERROR}] Failed to create client.`);
  }

  logger.info('CLIENT', `Client created: ${inserted[0].id} for user ${userId}`);
  return mapToClientResponse(inserted[0]);
}

export async function updateClient(
  userId: string,
  clientId: string,
  input: UpdateClientInput
): Promise<ClientResponse> {
  // Verify ownership
  await getClientById(userId, clientId);

  const updated = await db
    .update(clients)
    .set({
      name: input.name,
      email: input.email !== undefined ? input.email : undefined,
      phone: input.phone !== undefined ? input.phone : undefined,
      address: input.address !== undefined ? input.address : undefined,
    })
    .where(and(eq(clients.id, clientId), eq(clients.user_id, userId)))
    .returning();

  if (updated.length === 0) {
    throw new Error(`[${ErrorCode.INTERNAL_ERROR}] Failed to update client.`);
  }

  logger.info('CLIENT', `Client updated: ${clientId}`);
  return mapToClientResponse(updated[0]);
}

export async function deleteClient(userId: string, clientId: string): Promise<void> {
  // Verify ownership
  await getClientById(userId, clientId);

  try {
    await db
      .delete(clients)
      .where(and(eq(clients.id, clientId), eq(clients.user_id, userId)));
    logger.info('CLIENT', `Client deleted: ${clientId}`);
  } catch (error: unknown) {
    // If references exist, ON DELETE RESTRICT on invoices foreign key will trigger this error
    logger.error('CLIENT', `Failed to delete client: ${clientId}`, error);
    throw new Error(`[${ErrorCode.INTERNAL_ERROR}] Cannot delete client because there are invoices linked to them.`);
  }
}
