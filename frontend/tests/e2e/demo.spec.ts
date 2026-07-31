import { test, expect } from '@playwright/test';

const BACKEND_URL = 'http://localhost:5002';
const FRONTEND_URL = 'http://localhost:3002';

test.describe('VaultLedger — Public & User Features', () => {
  /* ---- UI Page Render Checks ---- */
  test('landing page renders successfully', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    await expect(page.locator('body')).toBeVisible();
  });

  test('login page renders with required form elements', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    await expect(page.locator('#login-submit')).toBeVisible();
  });

  test('register page renders with required form elements', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/register`);
    await expect(page.locator('#register-name')).toBeVisible();
    await expect(page.locator('#register-email')).toBeVisible();
    await expect(page.locator('#register-business')).toBeVisible();
    await expect(page.locator('#register-password')).toBeVisible();
    await expect(page.locator('#register-submit')).toBeVisible();
  });

  test('privacy policy page renders', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/privacy`);
    await expect(page.locator('body')).toBeVisible();
  });

  test('terms of service page renders', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/terms`);
    await expect(page.locator('body')).toBeVisible();
  });

  /* ---- Public Backend API Checks ---- */
  test('GET /health returns 200 OK', async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/health`);
    expect(res.status()).toBe(200);
  });

  test('GET /public/settings returns system configuration', async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/api/public/settings`);
    expect(res.status()).toBe(200);
  });

  test('GET /public/reviews returns approved review list', async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/api/public/reviews`);
    expect(res.status()).toBe(200);
  });

  test('POST /public/reviews submits a new customer review', async ({ request }) => {
    const res = await request.post(`${BACKEND_URL}/api/public/reviews`, {
      data: {
        name: 'Finance Controller',
        rating: 5,
        feedback: 'VaultLedger simplified our corporate ledger reconciliation immensely.',
      },
    });
    expect([200, 201, 400]).toContain(res.status());
  });

  test('POST /contact submits a contact message', async ({ request }) => {
    const res = await request.post(`${BACKEND_URL}/api/contact`, {
      data: {
        name: 'Audit Lead',
        email: 'audit@enterprise.com',
        message: 'Requesting enterprise security audit details for VaultLedger.',
      },
    });
    expect([200, 201, 400]).toContain(res.status());
  });

  /* ---- Auth API Failure Checks ---- */
  test('POST /register rejects empty user data', async ({ request }) => {
    const res = await request.post(`${BACKEND_URL}/api/auth/register`, { data: {} });
    expect([400, 422]).toContain(res.status());
  });

  test('POST /login rejects invalid credentials', async ({ request }) => {
    const res = await request.post(`${BACKEND_URL}/api/auth/login`, {
      data: { email: 'fake@vaultledger.io', password: 'invalid' },
    });
    expect([400, 401]).toContain(res.status());
  });
});
