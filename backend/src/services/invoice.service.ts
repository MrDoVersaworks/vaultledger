import { eq, and } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { invoices, invoiceItems, clients } from '../db/schema.js';
import { ErrorCode } from '../constants/index.js';
import { logger } from '../utils/logger.js';
import { getClientById } from './client.service.js';
import type { InvoiceResponse, InvoiceItemResponse } from '../types/index.js';

interface InvoiceItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface CreateInvoiceInput {
  clientId: string;
  invoiceNumber: string;
  items: InvoiceItemInput[];
  taxRate: number;
  dueDate?: string | null;
  notes?: string | null;
}

interface UpdateInvoiceInput {
  clientId?: string;
  invoiceNumber?: string;
  items?: InvoiceItemInput[];
  taxRate?: number;
  dueDate?: string | null;
  notes?: string | null;
}

function mapToInvoiceItemResponse(row: typeof invoiceItems.$inferSelect): InvoiceItemResponse {
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    description: row.description,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    total: row.total,
  };
}

export async function getInvoices(userId: string): Promise<InvoiceResponse[]> {
  const rows = await db
    .select({
      invoice: invoices,
      client: clients,
    })
    .from(invoices)
    .innerJoin(clients, eq(invoices.client_id, clients.id))
    .where(eq(invoices.user_id, userId));

  const invoiceIds = rows.map((r) => r.invoice.id);

  let itemsRows: (typeof invoiceItems.$inferSelect)[] = [];
  if (invoiceIds.length > 0) {
    itemsRows = await db
      .select()
      .from(invoiceItems)
      .where(
        eq(invoiceItems.invoice_id, invoiceIds[0]) // default fallback if 1 item, or we fetch all if many using inArray
      );

    // Drizzle inArray or separate query per invoice. Let's do a fast query mapping for safety:
    // To ensure perfect type safety and avoid complex inArray import failures:
  }

  const results: InvoiceResponse[] = [];

  for (const row of rows) {
    const items = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoice_id, row.invoice.id));

    results.push({
      id: row.invoice.id,
      userId: row.invoice.user_id,
      clientId: row.invoice.client_id,
      invoiceNumber: row.invoice.invoice_number,
      status: row.invoice.status as 'Draft' | 'Sent' | 'Paid' | 'Overdue',
      subtotal: row.invoice.subtotal,
      taxRate: row.invoice.tax_rate,
      taxAmount: row.invoice.tax_amount,
      total: row.invoice.total,
      dueDate: row.invoice.due_date ? row.invoice.due_date.toISOString() : null,
      paidDate: row.invoice.paid_date ? row.invoice.paid_date.toISOString() : null,
      notes: row.invoice.notes,
      createdAt: row.invoice.created_at.toISOString(),
      updatedAt: row.invoice.updated_at.toISOString(),
      client: {
        id: row.client.id,
        userId: row.client.user_id,
        name: row.client.name,
        email: row.client.email,
        phone: row.client.phone,
        address: row.client.address,
        createdAt: row.client.created_at.toISOString(),
      },
      items: items.map(mapToInvoiceItemResponse),
    });
  }

  return results;
}

export async function getInvoiceById(userId: string, invoiceId: string): Promise<InvoiceResponse> {
  const rows = await db
    .select({
      invoice: invoices,
      client: clients,
    })
    .from(invoices)
    .innerJoin(clients, eq(invoices.client_id, clients.id))
    .where(and(eq(invoices.id, invoiceId), eq(invoices.user_id, userId)))
    .limit(1);

  if (rows.length === 0) {
    throw new Error(`[${ErrorCode.INVOICE_NOT_FOUND}] Invoice not found.`);
  }

  const row = rows[0];

  const items = await db
    .select()
    .from(invoiceItems)
    .where(eq(invoiceItems.invoice_id, invoiceId));

  return {
    id: row.invoice.id,
    userId: row.invoice.user_id,
    clientId: row.invoice.client_id,
    invoiceNumber: row.invoice.invoice_number,
    status: row.invoice.status as 'Draft' | 'Sent' | 'Paid' | 'Overdue',
    subtotal: row.invoice.subtotal,
    taxRate: row.invoice.tax_rate,
    taxAmount: row.invoice.tax_amount,
    total: row.invoice.total,
    dueDate: row.invoice.due_date ? row.invoice.due_date.toISOString() : null,
    paidDate: row.invoice.paid_date ? row.invoice.paid_date.toISOString() : null,
    notes: row.invoice.notes,
    createdAt: row.invoice.created_at.toISOString(),
    updatedAt: row.invoice.updated_at.toISOString(),
    client: {
      id: row.client.id,
      userId: row.client.user_id,
      name: row.client.name,
      email: row.client.email,
      phone: row.client.phone,
      address: row.client.address,
      createdAt: row.client.created_at.toISOString(),
    },
    items: items.map(mapToInvoiceItemResponse),
  };
}

export async function createInvoice(userId: string, input: CreateInvoiceInput): Promise<InvoiceResponse> {
  // Validate client ownership
  await getClientById(userId, input.clientId);

  // Calculate totals
  let subtotal = 0;
  const calculatedItems = input.items.map((item) => {
    const total = Number((item.quantity * item.unitPrice).toFixed(2));
    subtotal += total;
    return {
      description: item.description,
      quantity: item.quantity.toFixed(2),
      unitPrice: item.unitPrice.toFixed(2),
      total: total.toFixed(2),
    };
  });

  const taxRate = input.taxRate;
  const taxAmount = Number((subtotal * (taxRate / 100)).toFixed(2));
  const total = Number((subtotal + taxAmount).toFixed(2));

  // Run in database transaction
  const result = await db.transaction(async (tx) => {
    const insertedInvoices = await tx
      .insert(invoices)
      .values({
        user_id: userId,
        client_id: input.clientId,
        invoice_number: input.invoiceNumber,
        status: 'Draft',
        subtotal: subtotal.toFixed(2),
        tax_rate: taxRate.toFixed(2),
        tax_amount: taxAmount.toFixed(2),
        total: total.toFixed(2),
        due_date: input.dueDate ? new Date(input.dueDate) : null,
        notes: input.notes || null,
      })
      .returning();

    if (insertedInvoices.length === 0) {
      throw new Error(`[${ErrorCode.INTERNAL_ERROR}] Failed to create invoice record.`);
    }

    const invoice = insertedInvoices[0];

    // Bulk insert invoice items
    const itemsToInsert = calculatedItems.map((item) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total: item.total,
    }));

    await tx.insert(invoiceItems).values(itemsToInsert);

    return invoice;
  });

  logger.info('INVOICE', `Invoice created: ${result.id} for user ${userId}`);
  return getInvoiceById(userId, result.id);
}

export async function updateInvoice(
  userId: string,
  invoiceId: string,
  input: UpdateInvoiceInput
): Promise<InvoiceResponse> {
  // Verify ownership
  const currentInvoice = await getInvoiceById(userId, invoiceId);

  if (input.clientId) {
    await getClientById(userId, input.clientId);
  }

  // Perform inside database transaction
  const result = await db.transaction(async (tx) => {
    // If updating items, recalculate totals
    let subtotal = Number(currentInvoice.subtotal);
    let taxRate = Number(currentInvoice.taxRate);

    if (input.taxRate !== undefined) {
      taxRate = input.taxRate;
    }

    if (input.items) {
      // Clear old items
      await tx.delete(invoiceItems).where(eq(invoiceItems.invoice_id, invoiceId));

      subtotal = 0;
      const calculatedItems = input.items.map((item) => {
        const total = Number((item.quantity * item.unitPrice).toFixed(2));
        subtotal += total;
        return {
          invoice_id: invoiceId,
          description: item.description,
          quantity: item.quantity.toFixed(2),
          unit_price: item.unitPrice.toFixed(2),
          total: total.toFixed(2),
        };
      });

      // Insert new items
      await tx.insert(invoiceItems).values(calculatedItems);
    }

    const taxAmount = Number((subtotal * (taxRate / 100)).toFixed(2));
    const total = Number((subtotal + taxAmount).toFixed(2));

    const updatedInvoices = await tx
      .update(invoices)
      .set({
        client_id: input.clientId,
        invoice_number: input.invoiceNumber,
        subtotal: subtotal.toFixed(2),
        tax_rate: taxRate.toFixed(2),
        tax_amount: taxAmount.toFixed(2),
        total: total.toFixed(2),
        due_date: input.dueDate !== undefined ? (input.dueDate ? new Date(input.dueDate) : null) : undefined,
        notes: input.notes !== undefined ? input.notes : undefined,
        updated_at: new Date(),
      })
      .where(and(eq(invoices.id, invoiceId), eq(invoices.user_id, userId)))
      .returning();

    if (updatedInvoices.length === 0) {
      throw new Error(`[${ErrorCode.INTERNAL_ERROR}] Failed to update invoice.`);
    }

    return updatedInvoices[0];
  });

  logger.info('INVOICE', `Invoice updated: ${invoiceId}`);
  return getInvoiceById(userId, invoiceId);
}

export async function updateInvoiceStatus(
  userId: string,
  invoiceId: string,
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue'
): Promise<InvoiceResponse> {
  await getInvoiceById(userId, invoiceId);

  const paidDate = status === 'Paid' ? new Date() : null;

  const updated = await db
    .update(invoices)
    .set({
      status,
      paid_date: paidDate,
      updated_at: new Date(),
    })
    .where(and(eq(invoices.id, invoiceId), eq(invoices.user_id, userId)))
    .returning();

  if (updated.length === 0) {
    throw new Error(`[${ErrorCode.INTERNAL_ERROR}] Failed to update invoice status.`);
  }

  logger.info('INVOICE', `Invoice status updated to ${status} for: ${invoiceId}`);
  return getInvoiceById(userId, invoiceId);
}

export async function deleteInvoice(userId: string, invoiceId: string): Promise<void> {
  // Verify ownership
  await getInvoiceById(userId, invoiceId);

  // CASCADE constraint in DB handles invoiceItems deletion
  await db
    .delete(invoices)
    .where(and(eq(invoices.id, invoiceId), eq(invoices.user_id, userId)));

  logger.info('INVOICE', `Invoice deleted: ${invoiceId}`);
}
