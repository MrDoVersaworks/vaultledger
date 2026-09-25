import test from 'node:test';
import assert from 'node:assert/strict';
import { invoiceSchema, expenseSchema, uuidParamSchema } from '../types/index.js';

test('invoice validation enforces database numeric bounds', () => {
  const valid = invoiceSchema.safeParse({
    clientId: '00000000-0000-0000-0000-000000000000',
    invoiceNumber: 'INV-TEST-1',
    items: [{ description: 'Item', quantity: 99999999.99, unitPrice: 9999999999.99 }],
    taxRate: 999.99,
  });
  assert.equal(valid.success, true);

  const tooLarge = invoiceSchema.safeParse({
    clientId: '00000000-0000-0000-0000-000000000000',
    invoiceNumber: 'INV-TEST-2',
    items: [{ description: 'Item', quantity: 100000000, unitPrice: 1 }],
    taxRate: 0,
  });
  assert.equal(tooLarge.success, false);
});

test('invoice validation accepts browser date-only due dates', () => {
  const result = invoiceSchema.safeParse({
    clientId: '00000000-0000-0000-0000-000000000000',
    invoiceNumber: 'INV-TEST-3',
    items: [{ description: 'Item', quantity: 1, unitPrice: 10 }],
    taxRate: 0,
    dueDate: '2026-09-25',
  });
  assert.equal(result.success, true);
});

test('resource IDs reject malformed identifiers at the boundary', () => {
  assert.equal(uuidParamSchema.safeParse({ id: 'not-a-uuid' }).success, false);
  assert.equal(uuidParamSchema.safeParse({ id: '00000000-0000-0000-0000-000000000000' }).success, true);
});

test('expense validation enforces database amount precision and range', () => {
  const result = expenseSchema.safeParse({
    description: 'Test expense',
    amount: 10000000000,
    date: '2026-09-25T12:00:00.000Z',
  });
  assert.equal(result.success, false);
});
