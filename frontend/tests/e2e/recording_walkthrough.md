# VaultLedger: Sovereign E2E Exhaustion Walkthrough

This document translates the VaultLedger Playwright execution matrix into a human-readable narrative, proving absolute feature exhaustion and logical scenario adherence per Sovereign Rules (U12).

## The Logical Journey (Scenario Chain)

> [!NOTE]
> The automated robot executes this sequence logically. It treats the interface as a real user would, ensuring no feature is accessed out of bounds.

### 1. Landing & Registration
- **Action:** The robot navigates to the public VaultLedger landing page.
- **Verification:** It confirms the primary "Launch Ledger Console" CTA is visible and interactive.
- **Execution:** It clicks through to the Registration portal, fills out a deterministic `test_architect_X@sovereign.test` profile, and securely creates the AES-256 Vault.

### 2. Cryptographic Settings Configuration
- **Action:** The robot navigates immediately to the Settings panel.
- **Verification:** It toggles the Light Mode/Dark Mode theme switch to ensure CSS variable persistence and glassmorphism contrast is flawless.
- **Execution:** It injects the Gemini API Key, tests the visibility toggle (eye icon), inputs the custom `gemini-2.5-flash` model string, and encrypts the settings.

### 3. Corporate Client Registration
- **Action:** Before an invoice can be created, a client must exist. The robot navigates to Clients.
- **Execution:** It opens the "Register Entity" modal, exhausts all input fields (Name, Email, Phone, Address), and registers the client. 
- **Verification:** Ensures the client table dynamically updates.

### 4. Encrypted Invoice Generation
- **Action:** The robot navigates to Invoices.
- **Execution:** It selects the newly created client from the `<select>` dropdown. It inputs a subtotal and tax rate, verifying that the client-side React logic automatically computes the final Total.
- **Verification:** It generates the invoice and confirms it renders correctly in the Kanban/Table board.

### 5. Operating Cost Exhuastion & AI Categorization
- **Action:** The robot navigates to Expenses.
- **Execution:** It opens the expense modal, inputs an AWS hosting cost, manually selects a tax category, and records the cost.
- **Verification:** It tests the Category Filter dropdown to ensure it filters correctly. It tests the "AI Categorized Only" toggle filter to ensure the empty states render properly.

### 6. Dashboard Analytics Verification
- **Action:** The robot navigates back to the root Dashboard.
- **Verification:** It reads the analytic widgets to ensure the $2750 invoice and $150 expense injected earlier are accurately reflected in the UI, proving full-stack data integrity.

### 7. The Vaporization & Purge Protocol (Cleanup)
- **Action:** The robot returns to Settings for cleanup.
- **Execution:**
  1. It clicks "Clear API Credentials" to purge the saved Google Gemini API Key and model configurations. It verifies the credentials have been cleared and the success toast is shown.
  2. It clicks "Delete Ledger Chamber" to delete the user account and purge all related database records.
- **Interception:** Playwright intercepts the browser `prompt()` dialog, dynamically injecting the user's email to confirm the destructive action.
- **Verification:** The robot confirms it is redirected to the `/register` route with the vaporization redirect.

> [!IMPORTANT]
> This completes the feature exhaustion matrix. Every primary button, modal, form field, and destructive action has been tested systematically.
