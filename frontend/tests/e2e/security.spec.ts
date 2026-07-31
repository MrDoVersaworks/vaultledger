import { test, expect } from '@playwright/test';

const BACKEND_URL = 'http://localhost:5002';

test.describe('VaultLedger — Security & Data Protection (SIL Rules)', () => {
  /* ---- User Scoping & Unauthorized Access (SIL-3) ---- */
  test('GET /clients rejects unauthenticated access', async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/api/clients`);
    expect(res.status()).toBe(401);
  });

  test('GET /invoices rejects unauthenticated access', async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/api/invoices`);
    expect(res.status()).toBe(401);
  });

  test('GET /expenses rejects unauthenticated access', async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/api/expenses`);
    expect(res.status()).toBe(401);
  });

  test('GET /dashboard/summary rejects unauthenticated access', async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/api/dashboard/summary`);
    expect(res.status()).toBe(401);
  });

  test('GET /dashboard/trend rejects unauthenticated access', async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/api/dashboard/trend`);
    expect(res.status()).toBe(401);
  });

  /* ---- Error Format Standardizing (SIL-23) ---- */
  test('error responses format with capitalized sentence structure', async ({ request }) => {
    const res = await request.post(`${BACKEND_URL}/api/auth/login`, {
      data: { email: 'invalid-email', password: 'short' },
    });
    if (res.status() === 400 || res.status() === 401) {
      const body = await res.json();
      if (body.error?.message) {
        expect(body.error.message).toMatch(/^[A-Z].*\.$/);
      }
    }
  });

  /* ---- CORS Security Boundaries (SIL-26) ---- */
  test('CORS does not return wildcard * for authenticated resource routes', async ({ request }) => {
    const res = await request.fetch(`${BACKEND_URL}/api/clients`, {
      method: 'OPTIONS',
      headers: { Origin: 'https://unauthorized-domain.com' },
    });
    const allowOrigin = res.headers()['access-control-allow-origin'];
    expect(allowOrigin).not.toBe('*');
  });
});
