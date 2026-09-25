import { test, expect } from '@playwright/test';

const BACKEND_URL = process.env.PLAYWRIGHT_BACKEND_URL?.trim() || 'http://localhost:5002';
const FRONTEND_URL = process.env.PLAYWRIGHT_BASE_URL?.trim() || 'http://localhost:3002';

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


test('refresh and logout require a trusted browser origin', async ({ request }) => {
  const refresh = await request.post(`${BACKEND_URL}/api/auth/refresh`, {
    headers: { Origin: 'https://unauthorized-domain.com' },
  });
  expect(refresh.status()).toBe(403);

  const logout = await request.post(`${BACKEND_URL}/api/auth/logout`, {
    headers: { Origin: 'https://unauthorized-domain.com' },
  });
  expect(logout.status()).toBe(403);
});


test('landing page does not persist authentication credentials in localStorage', async ({ page }) => {
  await page.goto(FRONTEND_URL);
  const keys = await page.evaluate(() => Object.keys(window.localStorage));
  expect(keys.some((key) => /token|auth|refresh|access/i.test(key))).toBe(false);
});


test('authenticated session lifecycle rotates refresh state and logout revokes it', async ({ request }) => {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  test.skip(!email || !password, 'E2E administrator credentials are not configured');

  const login = await request.post(`${BACKEND_URL}/api/auth/login`, {
    data: { email, password },
  });
  expect(login.status()).toBe(200);

  const refresh = await request.post(`${BACKEND_URL}/api/auth/refresh`, {
    headers: { Origin: 'http://localhost:3002' },
  });
  expect(refresh.status()).toBe(200);

  const logout = await request.post(`${BACKEND_URL}/api/auth/logout`, {
    headers: { Origin: 'http://localhost:3002' },
  });
  expect(logout.status()).toBe(200);

  const afterLogout = await request.post(`${BACKEND_URL}/api/auth/refresh`, {
    headers: { Origin: 'http://localhost:3002' },
  });
  expect(afterLogout.status()).toBe(401);
});
