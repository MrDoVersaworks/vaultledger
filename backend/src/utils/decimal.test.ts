import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDecimal, formatDecimal, lineTotalCents, taxCents } from './decimal.js';

test('fixed-point invoice line totals do not use binary floating point', () => {
  const quantity = parseDecimal('0.1', 2);
  const unitPrice = parseDecimal('0.2', 2);
  assert.equal(formatDecimal(lineTotalCents(quantity, unitPrice), 2), '0.02');
});

test('line totals round to cents deterministically', () => {
  const quantity = parseDecimal('1.01', 2);
  const unitPrice = parseDecimal('1', 2);
  assert.equal(formatDecimal(lineTotalCents(quantity, unitPrice), 2), '1.01');
});

test('tax calculation is fixed point', () => {
  const subtotal = parseDecimal('100.00', 2);
  const rate = parseDecimal('7.25', 2);
  assert.equal(formatDecimal(taxCents(subtotal, rate), 2), '7.25');
});
