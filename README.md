# VaultLedger — Sovereign AI-Powered Accounting Terminal

[![VaultLedger CI/CD](https://github.com/MrDoVersaworks/vaultledger/actions/workflows/main.yml/badge.svg)](https://github.com/MrDoVersaworks/vaultledger/actions)
[![Playwright E2E](https://img.shields.io/badge/QA-Playwright-green)](https://playwright.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**VaultLedger** is a production-grade, highly secure financial orchestration terminal designed for **Absolute Data Sovereignty**. It combines strict, zero-trust cryptographic ledger control with private, user-provisioned AI expense categorization (BYOK) to create a premium accounting ecosystem for independent contractors, high-velocity builders, and privacy-conscious founders.

---

## 🎯 Why VaultLedger?

In an era of centralized accounting SaaS products that scrap and sell transaction metadata, VaultLedger returns absolute financial agency to the individual:
- **Absolute AI Sovereignty:** Built on a "Bring Your Own Key" (BYOK) architecture, keeping your API costs lean and your data strictly out of public training models.
- **AES-256-GCM Vaulting:** Your private credentials are encrypted at rest with hardware-grade cryptography, decrypting exclusively in volatile memory during generation loops.
- **Sovereign Tenancy:** Explicit IDOR prevention shields every endpoint, enforcing user-scoped isolation at the database queries layer.
- **Zero-Friction Portability:** Complete ledger vaporization is built natively into the settings deck, providing full data erasure with a single confirmation.

---

## 👥 Targeted Cohorts

VaultLedger is custom-engineered for:
- **Privacy-Conscious Freelancers**: Sovereign professionals who manage high-yield corporate contracts and refuse to host client metadata on third-party tracking networks.
- **AI-First Developers**: Engineers who want to harness LLMs to automate categorization work without sacrificing their credentials or paying premium SaaS markups.
- **Security Officers & Auditors**: High-standards professionals who demand verifiable, local-first code patterns and deterministic database structures.

---

## 🚀 Core Systems Architecture

- **Sovereign Client Vault:** A highly organized client entity registry ensuring invoices are mapped with strict foreign-key integrity.
- **Dynamic Invoice Engine:** Live reactive client-side subtotal, taxation, and final total recalculations, backing immutable draft and paid invoice registers.
- **AI-Augmented Expense Inception:** Powered by Google Gemini (`gemini-2.5-flash`), the system automatically reviews transactions (e.g., "AWS Cloud Hosting") and maps them to standard tax categories ("Software & Subscriptions") via structured JSON outputs.
- **Interactive Financial Cockpit:** An administrative hub showing real-time gross earnings, active operating costs, and tax liabilities with modern, beautifully responsive charts.

---

## 🧪 Evaluation: The Full Lifecycle Demo

VaultLedger features a rigorous, high-transparency **Playwright E2E Showcase** that simulates a full contractor journey. It doesn't just test units; it proves frontend-to-database integrity under real-world visual load.

### What the showcase proves:
1. **Zero-Friction Authentication:** Deterministic registration and automatic session creation.
2. **AI Settings Provisioning:** Inception of your private Gemini key and dynamic model settings.
3. **Client Entity Inception:** Automated registration of a new corporate client with complete fields.
4. **Reactive Invoice Generation:** Drafting an invoice, verifying the dynamic multi-step tax recalculations, and submitting the record.
5. **Operating Cost Logging:** Inception of a manual expense, category filtering stress-tests, and verify active state transitions.
6. **Cockpit Sync Validation:** Confirms that dashboard statistics accurately reflect the generated invoices and expenses.
7. **Destructive Vaporization Protocol:** Execution of a complete user registry wipe, clearing API keys and cascading database purges to restore a pristine state.

### Run the Showcase locally:
```bash
# 1. Ensure backend and frontend dev servers are active
# 2. Run the headed showcase matrix:
cd frontend
npx playwright test tests/e2e/recording.spec.ts --project=chromium --workers=1 --headed
```
📖 **[E2E Recording Walkthrough](./frontend/tests/e2e/recording_walkthrough.md):** Read the comprehensive, line-by-line engineering breakdown of the automated showcase.

---

## 🛡️ Sovereign Security Map

VaultLedger enforces strict cryptographic boundaries to maintain total integrity:
- **Stateless Decryption Pipe:** Credentials are saved to PostgreSQL using a unique IV and authentication tag (`AES-256-GCM`). Plaintext keys are never written to disk.
- **Identity Cascades:** Deleting your ledger chamber triggers a clean cascading transaction, vaporizing your profile, clients, invoices, items, and expenses permanently.
- **Deterministic Validation:** Frontend and backend share strict Zod validation schemas, blocking corrupted structures before database writes.

---

## 🚀 Engineering Quality Matrix

| Pillar | Status | Core Implementation |
| :--- | :--- | :--- |
| **Sovereign AI BYOK** | ✅ | AES-256-GCM Credential Vaulting with Dynamic Model selection. |
| **Reactive Invoicing** | ✅ | In-browser floating-point calculations with real-time VAT/Sales Tax injection. |
| **Multi-Tenant Scoping**| ✅ | Zero-Trust IDOR Shield via Drizzle ORM tenant scoping. |
| **Sovereign Purge** | ✅ | Interactive Vaporization cascading transaction for absolute data erasure. |
| **System Integrity** | ✅ | Strict TypeScript compilation and zero-compiler-warning build system. |

---

## 🧩 Solved Engineering Challenges

### 1. The Ephemeral Decryption Pipe
**Challenge:** Storing third-party API keys in plain text presents a massive security liability. If the database leaks, all credentials are compromised.
**Solution:** VaultLedger uses a **Cryptographic Ephemeral Pipe**. When a user saves their key, the backend generates a random 12-byte IV and runs `crypto.createCipheriv('aes-256-gcm')`. During expense categorization, the key is decrypted in volatile memory only for the duration of the Gemini SDK transaction and is immediately scrubbed from the heap.

### 2. High-Precision Financial Rounding
**Challenge:** JavaScript numbers suffer from floating-point inaccuracies (e.g., `0.1 + 0.2 === 0.30000000000000004`), which can cause database mismatch states for tax calculations.
**Solution:** The database uses Postgres `numeric` fields with custom scale limits (12, 2). The frontend leverages structured string-based scaling inside a reactive React hook, ensuring that rounding is deterministic and matches ledger standards across all tax tiers.

### 3. Cascading Vaporization
**Challenge:** In relational structures, deleting a parent record (user) can leave orphan rows (invoice items) or raise database integrity constraints that block account deletion.
**Solution:** Engineered an **Atomic Cascade Purge**. All foreign keys use `onDelete: 'cascade'`, except `client_id` on invoices which mandates `onDelete: 'restrict'` for active bookkeeping safety. The delete-chamber endpoint performs a transactional deletion of the user record, instantly clean-sweeping all child tables securely.

### 4. Edge CDN Caching & Static Asset Optimization
**Challenge:** Dynamic Next.js client interfaces suffer from page loading and TTFB delays when serving static assets (CSS, icons, font assets) directly from serverless execution instances.
**Solution:** Leveraged Vercel's global edge network (Edge CDN) by implementing strict cache-control header policies for all static assets and pre-rendering static routes. This guarantees sub-10ms delivery of resources and eliminates cold-start overhead for static asset requests.

### 5. Zero-Leak Contact Forms & Attachment Warning Modal
**Challenge:** Direct contact email addresses are prone to harvesting spam bots, and incoming invoices/receipt attachments present major file execution hazards (such as active macros or infected PDFs) if run locally.
**Solution:** Replaced all raw email links with a client-side Contact Form utilizing React state-managed inputs. All invoice attachments and exports are intercepted by a secure warning gate modal that blocks download execution and instructs the user to run downloads strictly inside an isolated **Virtual Machine (VM)**, protecting their main workstation.

---

## 🏗️ Strategic Deployment (Vercel Monorepo)

VaultLedger operates as a highly available **Unified Vercel Monorepo**:

### 1. Root Configuration
- **Continuous Deployment:** Handled natively by Vercel. Any push to `main` instantly triggers serverless builds.
- **Frontend App:** Set up in the `frontend` root. Served globally via Vercel's Edge CDN.
- **Backend API:** Set up in the `backend` root. Deployed as Node.js Serverless Functions for sub-millisecond cold boots.

### 2. Database Layer
- **Neon Serverless PostgreSQL:** Scales storage and computation to 0 when idle, reducing operational costs while preserving production-grade speed.

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v20+)
- PostgreSQL instance (Neon recommended)

### Installation

1. **Clone and Setup Backend:**
   ```bash
   cd backend
   npm install
   # Create .env based on .env.example
   npm run db:generate
   npm run db:push
   npm run dev
   ```

2. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   # Create .env based on .env.example
   npm run dev
   ```

---

## 👨‍💻 Sovereign Engineering & Support

VaultLedger is a signature release in the portfolio sequence.

**Architected by Oyewole Favour**  
📧 Contact via the in-app **Contact Form** (accessible from the dashboard sidebar)  
💼 [LinkedIn](https://www.linkedin.com/in/mrdoversaworks/)  
🌐 [GitHub](https://github.com/MrDoVersaworks/)
