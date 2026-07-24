import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('VaultLedger Admin & Settings', () => {
  test('admin inbox and settings page inspection', async ({ page }) => {
    test.setTimeout(60000);
    const screenshotDir = path.resolve(__dirname, '../../public/screenshots');
    if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

    // 1. Admin Inbox View
    await page.goto('http://localhost:3002/admin/inbox', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotDir, 'admin_inbox.png') });
  });
});
