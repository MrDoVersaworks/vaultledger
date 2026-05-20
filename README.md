# VaultLedger: Sovereign Invoicing & AI Ledger

VaultLedger is a deterministic, self-hosted accounting terminal built with Next.js and Node.js Express. It merges strict, cryptographic data sovereignty with the velocity of AI-augmented expense categorization, delivering a production-grade infrastructure designed for high-end contractors and sovereign engineers.

> [!IMPORTANT]  
> **Interactive Automated Demo**: This project includes an exhaustive Playwright E2E automation suite.  
> 👉 [Read the E2E Recording Walkthrough](./frontend/tests/e2e/recording_walkthrough.md)

---

## 🏗 Architectural Blueprint

### The Sovereign Stack
- **Frontend Layer:** Next.js (App Router), React, TailwindCSS, Lucide Icons.
- **Serverless API:** Node.js, Express, strict TypeScript, Zod Schema Validation.
- **Persistence Layer:** Serverless PostgreSQL via Neon, Drizzle ORM.
- **AI Intelligence:** Private Google Gemini (`gemini-2.5-flash`), BYOK (Bring Your Own Key) architecture.
- **Cryptographic Security:** AES-256-GCM symmetric encryption for API Key storage at rest.

### Core Systems Matrix
1. **The Client Vault:** Deterministic entity registry for robust invoice mapping.
2. **Cryptographic Invoice Engine:** Real-time subtotal/tax recalculation, generating clean, immutable draft/paid records.
3. **AI Expense Reconciliation:** Users can input a raw description (e.g., "AWS Cloud Hosting") and Gemini AI instantly maps it to strict tax categories ("Software & SaaS").
4. **Sovereign IDOR Prevention:** Every database query explicitly mandates tenant scoping `(user_id === session_id)`, achieving zero-trust authorization.

---

## ⚡ Setup & Local Execution

VaultLedger operates as a highly available Vercel monorepo. 

### Prerequisites
- Node.js (v18+)
- Postgres Database (Neon recommended)
- `GEMINI_API_KEY` (for AI processing)
- `JWT_SECRET` and `ENCRYPTION_KEY` (32-byte hex for AES-256)

### Installation
1. Clone the repository and navigate to the project root.
2. Split your terminal to initialize both systems simultaneously:

**Backend Shell:**
```bash
cd backend
npm install
# Configure your .env (DATABASE_URL, JWT_SECRET, ENCRYPTION_KEY)
npm run db:generate
npm run db:push
npm run dev
```

**Frontend Shell:**
```bash
cd frontend
npm install
# Configure your .env (NEXT_PUBLIC_API_URL=http://localhost:5000)
npm run dev
```

---

## 🚀 Deployment & CI/CD Pipeline

VaultLedger utilizes a streamlined, cloud-native approach to deployment:

- **Continuous Deployment (CD):** Because the project is deployed via Vercel, CD is handled **natively**. Vercel automatically watches the GitHub `main` branch. Any git push instantly triggers a build, meaning explicit CD deployment scripts (`.github/workflows/deploy.yml`) are redundant and thus safely omitted.
- **Continuous Integration (CI):** Local testing scripts (like Playwright E2E suites) act as the primary CI validation gate before code is pushed to production. SEO metadata injection is built directly into the Next.js `layout.tsx` layer, allowing Google crawlers to index the application natively without secondary configuration.

---

## 🧪 E2E Playwright Exhaustion Suite

Following Sovereign Engineering guidelines, VaultLedger leverages Playwright as a continuous "Demo Engine". The test script rigorously exhausts every visual feature, transitioning across Light and Dark themes, generating invoices, and auto-categorizing expenses using the AI integration.

To run the visualization matrix:
```bash
cd frontend
npx playwright test --headed
```

---

## 💼 Branding & Authorship
This infrastructure adheres to the **Sovereign Engineer Branding Strategy**, presenting architectural competence over language-specific limitations. The UI prioritizes absolute data control, AES-256 data sovereignty, and robust error boundaries.

**Architected by:** Oyewole Favour  
**System Designation:** Project 3 (Portfolio Series)
