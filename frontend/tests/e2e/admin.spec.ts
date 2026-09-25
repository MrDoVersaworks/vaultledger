import { test, expect } from '@playwright/test';

const BACKEND_URL = process.env.PLAYWRIGHT_BACKEND_URL?.trim() || 'http://localhost:5002';
const FRONTEND_URL = process.env.PLAYWRIGHT_BASE_URL?.trim() || 'http://localhost:3002';

test.describe('VaultLedger — Admin & Management Controls', () => {
  /* ---- Admin UI Page Renders ---- */
  test('admin inbox UI page renders', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/admin/inbox`);
    await expect(page.locator('body')).toBeVisible();
  });

  test('admin settings UI page renders', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/admin/settings`);
    await expect(page.locator('body')).toBeVisible();
  });

  /* ---- Admin API Endpoint Protection ---- */
  test('GET /admin/inbox rejects unauthenticated request', async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/api/admin/inbox`);
    expect(res.status()).toBe(401);
  });

  test('PATCH /admin/inbox/:id/read rejects unauthenticated request', async ({ request }) => {
    const res = await request.patch(`${BACKEND_URL}/api/admin/inbox/fake-msg-id/read`);
    expect(res.status()).toBe(401);
  });

  test('DELETE /admin/inbox/:id rejects unauthenticated request', async ({ request }) => {
    const res = await request.delete(`${BACKEND_URL}/api/admin/inbox/fake-msg-id`);
    expect(res.status()).toBe(401);
  });

  test('GET /admin/settings rejects unauthenticated request', async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/api/admin/settings`);
    expect(res.status()).toBe(401);
  });

  test('PUT /admin/settings rejects unauthenticated request', async ({ request }) => {
    const res = await request.put(`${BACKEND_URL}/api/admin/settings`, { data: {} });
    expect(res.status()).toBe(401);
  });

  test('GET /admin/reviews rejects unauthenticated request', async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/api/admin/reviews`);
    expect(res.status()).toBe(401);
  });

  test('PATCH /admin/reviews/:id/approve rejects unauthenticated request', async ({ request }) => {
    const res = await request.patch(`${BACKEND_URL}/api/admin/reviews/fake-review-id/approve`);
    expect(res.status()).toBe(401);
  });

  test('PATCH /admin/reviews/:id/approve rejects unauthenticated request', async ({ request }) => {
    const res = await request.patch(`${BACKEND_URL}/api/admin/reviews/fake-review-id/approve`);
    expect(res.status()).toBe(401);
  });

  test('DELETE /admin/reviews/:id rejects unauthenticated request', async ({ request }) => {
    const res = await request.delete(`${BACKEND_URL}/api/admin/reviews/fake-review-id`);
    expect(res.status()).toBe(401);
  });
});


test('admin can approve a pending public review', async ({ request }) => {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  test.skip(!email || !password, 'E2E administrator credentials are not configured');

  const review = await request.post(`${BACKEND_URL}/api/public/reviews`, {
    data: { name: 'E2E Reviewer', profession: 'Tester', rating: 5, feedback: 'E2E moderation workflow verification.' },
  });
  expect(review.status()).toBe(201);

  const login = await request.post(`${BACKEND_URL}/api/auth/login`, {
    data: { email, password },
  });
  expect(login.status()).toBe(200);
  const loginBody = await login.json();

  const reviewBody = await review.json();
  const approval = await request.patch(`${BACKEND_URL}/api/admin/reviews/${reviewBody.data.id}/approve`, {
    headers: { Authorization: `Bearer ${loginBody.data.accessToken}` },
  });
  expect(approval.status()).toBe(200);

  const publicReviews = await request.get(`${BACKEND_URL}/api/public/reviews`);
  expect(publicReviews.status()).toBe(200);
  const body = await publicReviews.json();
  expect(body.data.some((item: { id: string }) => item.id === reviewBody.data.id)).toBe(true);
});
