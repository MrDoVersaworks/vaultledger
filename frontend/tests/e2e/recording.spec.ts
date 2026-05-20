import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// =====================================================================
// VAULTLEDGER PLAYWRIGHT EXHAUSTION MATRIX
// Requirement: Exhaust all visual features systematically.
// Requirement: Sensible scenario chain (Register -> Settings -> Client -> Invoice -> Expense -> Dashboard -> Delete)
// =====================================================================

// Manual Backend .env Retrieval (Frictionless & Secure)
const getBackendKey = () => {
  try {
    const envPath = path.resolve(__dirname, '../../../backend/.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/GEMINI_API_KEY=["']?([^"'\n]+)["']?/);
      return match ? match[1] : null;
    }
  } catch (e) {
    return null;
  }
  return null;
};

const SYSTEM_API_KEY = process.env.GEMINI_API_KEY || getBackendKey() || 'sk-SOVEREIGN-DEMO-KEY';

test.describe('VaultLedger Feature Exhaustion & E2E Validation', () => {
  // Use a deterministic demo email to avoid state collision
  const demoEmail = `test_architect_${Date.now()}@sovereign.test`;
  const demoPassword = 'Password123!';

  test('Execution Matrix: Full System Navigation & Feature Stress', async ({ page }) => {
    // Elevate timeout limit to accommodate full E2E execution matrix
    test.setTimeout(120000);
    
    // Output browser console logs and errors directly to terminal for debugging
    page.on('console', msg => console.log(`[BROWSER LOG] [${msg.type()}] ${msg.text()}`));
    page.on('pageerror', err => console.log(`[BROWSER ERROR] ${err.message}`));

    // Enable automated dialog acceptance for prompts & confirms
    page.on('dialog', async dialog => {
      if (dialog.type() === 'prompt') {
        await dialog.accept(demoPassword);
      } else {
        await dialog.accept();
      }
    });

    // ---------------------------------------------------------
    // 1. LANDING PAGE & REGISTRATION
    // ---------------------------------------------------------
    await test.step('Navigate to Landing and Register', async () => {
      await page.goto('/');
      // Verify landing page CTA
      await expect(page.getByRole('link', { name: /Launch Ledger Console/i })).toBeVisible();
      
      // Navigate to registration
      await page.goto('/register');
      await page.waitForTimeout(2000); // Pause for audience view
      
      // Fill out registration fields using specific unique IDs
      await page.fill('#register-name', 'Sovereign Test User');
      await page.fill('#register-email', demoEmail);
      await page.fill('#register-business', 'Sovereign Test Company');
      await page.fill('#register-password', demoPassword);
      
      // Click register button
      await page.click('#register-submit');
      
      // Should redirect to dashboard (allow 30s timeout for database cold boot)
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 30000 });
      await expect(page.locator('text=Financial Cockpit')).toBeVisible({ timeout: 30000 });
      await page.waitForTimeout(3000); // Pause — let audience see the welcome state
    });

    // ---------------------------------------------------------
    // 2. SETTINGS CONFIGURATION (API KEY & THEME)
    // ---------------------------------------------------------
    await test.step('Configure Gemini AI Settings & Theme', async () => {
      await page.click('#nav-settings');
      await expect(page).toHaveURL(/\/settings/, { timeout: 15000 });
      
      // Test Light/Dark Mode Toggle
      const themeBtn = page.locator('#theme-toggle-btn');
      await themeBtn.click(); // Switch to Light
      await page.waitForTimeout(1000); // Visual pause in light mode
      await themeBtn.click(); // Switch back to Dark
      await page.waitForTimeout(500);
      
      // Configure API Key (Enter key into the password field)
      await page.fill('input[type="password"]', SYSTEM_API_KEY);
      
      // Configure model
      const modelInput = page.locator('input[placeholder="e.g. gemini-2.5-flash"]');
      await modelInput.fill('gemini-2.5-flash');
      
      // Save Settings
      await page.click('#btn-save-settings');
      await expect(page.locator('text=AI cryptographic settings saved successfully')).toBeVisible();
      await page.waitForTimeout(2000); // Pause to let success toast register
    });

    // ---------------------------------------------------------
    // 3. CLIENT MANAGEMENT
    // ---------------------------------------------------------
    await test.step('Register a Corporate Client Entity', async () => {
      await page.click('#nav-clients');
      await expect(page).toHaveURL(/\/clients/, { timeout: 15000 });
      
      // Open modal
      await page.click('#btn-register-entity');
      
      // Fill out client entity fields using exact placeholder values
      await page.fill('input[placeholder="Acme Global Corporation"]', 'Sovereign Test Client');
      await page.fill('input[placeholder="billing@acme.com"]', 'billing@sovereigntest.com');
      await page.fill('input[placeholder="+1 (555) 123-4567"]', '+1 555-000-0000');
      await page.fill('textarea[placeholder*="123 Corporate Blvd"]', '123 Secure Lane');
      
      // Submit form
      await page.click('button:has-text("Record Client Entity")');
      await expect(page.locator('text=Sovereign Test Client')).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(3000); // Pause — show the new client card
    });

    // ---------------------------------------------------------
    // 4. INVOICE GENERATION
    // ---------------------------------------------------------
    await test.step('Draft an Encrypted Invoice', async () => {
      await page.click('#nav-invoices');
      await expect(page).toHaveURL(/\/invoices/, { timeout: 15000 });
      
      // Navigate to draft interface (Open modal)
      await page.click('#btn-add-invoice');
      
      // Select Client Entity (First select element)
      await page.locator('select').first().selectOption({ label: 'Sovereign Test Client' });
      
      // Fill out dynamic line item fields
      await page.fill('input[placeholder="Description of deliverables"]', 'Consulting Services');
      await page.fill('input[placeholder="Qty"]', '1');
      await page.fill('input[placeholder="Price"]', '2500');
      
      // Select Tax Rate (Second select element, select 10%)
      await page.locator('select').nth(1).selectOption('10');
      
      // Observe Auto-calculation (Total should be 2750)
      await expect(page.locator('text=$2750.00')).toBeVisible({ timeout: 15000 });
      
      // Submit invoice
      await page.click('button:has-text("Record Invoice")');
      
      // Expect modal to close and the new invoice total to be visible in the list
      await expect(page.locator('text=$2750.00')).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(4000); // Pause — show the generated invoice in list
    });

    // ---------------------------------------------------------
    // 5. EXPENSE RECORDING & FILTERING
    // ---------------------------------------------------------
    await test.step('Log Operating Costs & Test Filtering', async () => {
      await page.click('#nav-expenses');
      await expect(page).toHaveURL(/\/expenses/, { timeout: 15000 });
      
      // Open Expense Modal
      await page.click('#btn-add-expense');
      
      // Fill out manual expense
      await page.fill('#input-expense-description', 'Server Hosting');
      await page.fill('#input-expense-amount', '150');
      
      // Toggle off the AI checkbox to manually choose category
      await page.click('#btn-toggle-ai');
      
      // Manual Category Dropdown select (use Software & Subscriptions from STANDARD_CATEGORIES)
      await page.selectOption('#select-expense-category', { label: 'Software & Subscriptions' });
      
      // Record Expense (target submit button inside modal overlay, not the page-level button)
      const expenseModal = page.locator('.fixed.inset-0');
      await expenseModal.locator('button:has-text("Record Operating Cost")').click();
      
      // Verify Expense appeared
      await expect(page.locator('text=Server Hosting').first()).toBeVisible({ timeout: 15000 });
      
      // Test filtering using the filter dropdown ID
      await page.selectOption('#select-filter-category', { label: 'Software & Subscriptions' });
      await expect(page.locator('text=Server Hosting').first()).toBeVisible({ timeout: 15000 });
      
      await page.selectOption('#select-filter-category', { label: 'Travel' });
      await expect(page.locator('text=No Expenses Recorded')).toBeVisible({ timeout: 15000 });
      
      // Reset filter
      await page.selectOption('#select-filter-category', { label: 'All Categories' });
      await page.waitForTimeout(3000); // Pause — show expense filtering result
    });

    // ---------------------------------------------------------
    // 6. DASHBOARD CHARTS VERIFICATION
    // ---------------------------------------------------------
    await test.step('Verify Analytics Rendering', async () => {
      await page.click('#nav-dashboard');
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
      
      // Verify the numbers we injected reflect on the dashboard widgets
      await expect(page.locator('text=$2750.00').first()).toBeVisible({ timeout: 15000 }); // Sent Invoices (Total)
      await expect(page.locator('text=$150.00').first()).toBeVisible({ timeout: 15000 }); // Total Expenses
      await page.waitForTimeout(4000); // Pause — let audience absorb dashboard analytics
    });

    // ---------------------------------------------------------
    // 7. DESTRUCTIVE ACTIONS & TEARDOWN (CLEANUP)
    // ---------------------------------------------------------
    await test.step('Teardown and Chamber Deletion', async () => {
      await page.click('#nav-settings');
      await page.waitForTimeout(1000);
      
      // 1. Clear API Credentials
      await expect(page.locator('#btn-clear-api-key')).toBeVisible({ timeout: 15000 });
      await page.click('#btn-clear-api-key');
      await expect(page.locator('text=API credentials cleared successfully')).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(2000);

      // 2. Delete Ledger Chamber
      await page.click('#btn-delete-chamber');
      
      // Expect redirect to register page after account vaporization
      await expect(page).toHaveURL(/\/register/, { timeout: 15000 });
      await page.waitForTimeout(2000);
    });

  });
});
