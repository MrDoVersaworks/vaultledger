# VaultLedger forensic remediation record

## Baseline and branch evidence

- Repository: MrDoVersaworks/VaultLedger
- Audit source: MrDoVersaworks/portfolio-audit-control
- Audit source revision: 7584de5629cf35716f6f80a7c98babab4009f8a7
- Main baseline: ea65b9d027fcae3654cc50a3083d9c0a38364716
- audit-remediation baseline: ea65b9d027fcae3654cc50a3083d9c0a38364716
- Therefore the remediation branch initially contained no unique commits over main. Historical Git history was inspected before changing behavior.

Main has not been modified by this remediation.

## Historical reconstruction rule

For every material change we record:
1. Original behavior at the frozen baseline.
2. The audit defect the change addresses.
3. Behavior that must remain.
4. Positive evidence that the defect is addressed.
5. Regression evidence for preserved behavior.

Where historical intent is not provable from the commit graph, the item remains explicitly open rather than being fixed by guesswork.

## Remediation batch completed so far

### Authentication and session boundary

- Removed browser localStorage access-token persistence. Access tokens are now memory-only.
- Hard reload/session restoration uses the server refresh response's authoritative user DTO instead of decoding identity from a JWT in the browser.
- Refresh tokens rotate transactionally: the presented token is deleted and a new hashed refresh token is issued in the same database transaction.
- Refresh returns the canonical user DTO so the client does not need to reconstruct profile state.
- Cookie-authenticated refresh/logout routes require a trusted configured Origin/Referer.
- Production refresh cookies use Secure + SameSite=None; development retains SameSite=Strict.
- Logout no longer requires a bearer access token to revoke the refresh-cookie session.
- Email identity is normalized to lowercase/trimmed form and the database now enforces a case-insensitive unique index.
- Users have an explicit server-side role; admin authorization reads the role from the database rather than matching a public email string.
- The configured ADMIN_EMAIL is promoted to the admin role after migrations, preserving the existing configured operator identity without allowing a public request to choose a role.
- Admin UI also checks the authoritative role; this is UX/defense-in-depth only and is not the security boundary.

### Public/contact boundary

- Removed the recruiter sandbox / shared demo credentials and automatic public account provisioning from the landing page.
- Removed client-side Gemini gatekeeping and BYOK key collection from the public contact form.
- Contact submissions now use the canonical API client and public /api/contact contract.
- The backend no longer trusts a client-supplied AI-screening boolean.
- Contact email content is sent as plain text rather than interpolated HTML.

### Public reviews

- Reviews now have an explicit moderation state.
- Existing reviews are migrated to approved to preserve their pre-existing public behavior.
- New reviews are stored as pending.
- Public reads return approved reviews only.
- An admin-only approval endpoint exists.
- The frontend no longer treats localStorage as the source of truth for reviews; it reads/writes the public review API and tells submitters that moderation is required.

### API/contract surfaces

- Production frontend API configuration now fails closed when NEXT_PUBLIC_API_URL is absent instead of silently inventing a localhost/fallback origin.
- Admin inbox reads use an explicit /api/admin/inbox/:id/read contract.
- Admin inbox responses are projected into stable camelCase DTOs rather than leaking database column names.
- Public settings are projected to an explicit public DTO rather than returning the whole settings row.

### Persistent security state and deployment semantics

- The original rate limiter used the default in-memory express-rate-limit store. That state is process-local and therefore not reliable across serverless/restarted/multi-instance deployments.
- Rate-limit counters are now persisted in PostgreSQL and keyed by limiter + client IP, with atomic window rollover. Auth, public contact submission, and public review submission use the persistent limiter.
- The backend explicitly trusts one reverse proxy hop so the limiter receives the client IP when deployed behind Render/Vercel-style ingress.
- The JWT access-token blocklist was process-local. It is now backed by PostgreSQL with expiry-aware revocation records, so logout/account deletion invalidation survives process restarts and multiple instances.
- Expired revocation/rate-limit records are cleaned during security-state activity.
- The migration journal now registers the remediation migrations so db:migrate can discover 0003/0004/0005.

### Data integrity and financial arithmetic

- Invoice numbers are now unique per user; migration 0006 refuses to silently rewrite existing duplicate invoice numbers and instead fails explicitly for manual reconciliation.
- Invoice line/tax calculations no longer use JavaScript floating-point arithmetic for financial totals.
- Invoice and expense inputs are explicitly constrained to the database's two-decimal money precision; invoice arithmetic now passes the correct two-decimal scale into the fixed-point helpers.
- Dashboard monthly revenue/expense aggregation uses integer cents internally before converting to the existing numeric API contract.
- A fixed-point BigInt helper performs quantity/price multiplication and tax rounding before values are persisted as decimal strings.
- Targeted regression tests cover 0.1 × 0.2, deterministic half-cent rounding, and 7.25% tax.

## Preservation obligations

- Normal registration/login still returns an authenticated user and starts the same refresh-cookie session.
- Session restoration still returns the user to an authenticated state after a hard reload, but identity comes from the server DTO.
- Existing configured admin identity is retained through migration.
- Existing public reviews remain visible after migration; only newly submitted reviews require approval.
- Contact submissions still reach the backend contact pipeline without exposing a provider key to the browser.
- Admin inbox remains readable and deletable; the read action now targets its actual backend endpoint.
- Invoice storage remains decimal-string based and invoice totals remain rounded to cents.

## Verification status

A backend test command was added: tsx --test src/utils/*.test.ts

The fixed-point test suite was added at backend/src/utils/decimal.test.ts.

GitHub status on the current remediation tip reports only Vercel deployment failures caused by the Vercel build-rate-limit target. No GitHub Actions check-runs are being returned for the remediation commits, so CI execution cannot currently be treated as evidence of passing type/build/E2E tests. The workflow itself has been consolidated to run backend type/unit/build checks, frontend type/build checks, PostgreSQL migrations, E2E seeding, and Playwright E2E tests when Actions execution is available. Therefore runtime/build verification is not yet closed.

## Explicitly open / not yet closed

- Distributed/persistent rate limiting across auth/contact/public review paths. **Implemented; CI migration/E2E verification pending.**
- Persistent refresh/access-token revocation semantics. **Access-token revocation is now persistent; refresh-token rotation still needs concurrent-reuse runtime verification.**
- Full migration/snapshot validation against a real PostgreSQL database, including duplicate-email failure behavior. **CI database migration is now wired; duplicate-email migration behavior still needs a targeted fixture test.**
- Complete API contract reconciliation across every frontend/backend endpoint.
- Full billing/subscription, external-integration, worker/scheduler, recovery/fallback, and persistence review required by the audit handoff.
- Runtime integration tests for login -> refresh rotation -> logout, admin denial/allowance, public review moderation, contact delivery, and invoice arithmetic. **E2E suite is wired; authenticated runtime paths still need dedicated seeded-user coverage.**
- Deployment/package verification after the current Vercel rate-limit block clears.
- GitHub Actions execution of the consolidated CI/E2E workflow; the repository currently exposes no check-runs for the remediation commits.

## Closure rule

This document is intentionally marked OPEN. No finding is considered closed merely because code was changed. Closure requires positive defect evidence plus regression/preservation evidence.

## Subsequent remediation batch

The audit findings were re-traced after the first pass rather than assumed closed. The following additional controls are now implemented:

- PostgreSQL-backed rate-limit buckets are used in production instead of the process-local express-rate-limit store. A general durable API limit is mounted at `/api`, with the tighter authentication window retained for auth routes. Rate limiting fails closed if persistent state cannot be reached.
- Access-token revocation is persisted in PostgreSQL and checked after JWT verification, so logout/account deletion revocation survives process/instance changes. Expired revocations are cleaned during revocation.
- Refresh-token rotation now locks the refresh-token row inside the transaction, preventing concurrent requests from successfully replaying the same one-time refresh token.
- Current-schema migration coverage was completed for contact messages, system settings, Resend notification columns, persistent security state, review moderation, normalized email/roles, and user-scoped invoice-number uniqueness. Migration journal entries were registered through migration 0007.
- Invoice quantity, unit-price, tax-rate, and expense amount validation now enforce the database precision/range contract. Browser date-only invoice due dates are accepted and normalized at the API boundary without changing the calendar date.
- Invoice numbers are unique per user at the database boundary and duplicate conflicts have a stable 409 contract.
- Dashboard financial sums remain decimal in PostgreSQL through aggregation; monthly presentation converts only the final grouped values for chart rendering. Outstanding receivables include both Sent and Overdue invoices.
- Client/invoice/expense resource IDs are validated as UUIDs at the route boundary.
- Legal pages no longer call nonexistent `/api/v1/public/legal/*` endpoints or render server-provided HTML through `dangerouslySetInnerHTML`; they are self-contained static pages.
- Public review moderation now has a stable admin DTO and an admin review moderation page with approve/delete actions.
- CI now contains backend unit/build gates, frontend type/build gates, database migration execution, and a Playwright E2E job. The Playwright suite was updated for the moderated review workflow, removed shared-demo assumptions, credential-free localStorage checks, trusted-origin refresh/logout behavior, and authenticated admin moderation/session lifecycle coverage.
- The frontend visual layer was simplified after the functional/security work: excessive gradient treatment and decorative blobs were removed from the affected screens, product language was normalized, and the existing functionality/navigation was preserved.

## Infrastructure verification

Vercel currently has two VaultLedger projects:
- `vaultledger` (Next.js frontend)
- `vaultledger-wa2z` (Express backend)

Both production projects currently point at `main` commit `ea65b9d027fcae3654cc50a3083d9c0a38364716`. No remediation branch has been promoted to production.

The latest known production Vercel builds from `main` completed successfully. The Vercel Git status checks associated with the remediation branch are currently blocked by Vercel build-rate-limit/account targets; this is an infrastructure/quota limitation rather than evidence of a source compiler failure.

Runtime verification of `audit-remediation` is therefore still not closed: the connected GitHub integration exposes workflow inspection but no workflow-dispatch capability, and the current Vercel rate limit prevents a remediation preview deployment from being used as the final runtime oracle.

## Verification ledger

| Finding | Static remediation | Targeted regression evidence | Runtime/E2E evidence | Status |
|---|---|---|---|---|
| VL-001 shared sandbox | Removed | E2E asserts no shared-demo credential language | Pending full preview E2E | Open pending runtime |
| VL-002 cache isolation | Canonical `req.userId` cache key | Static route inspection | Pending A-B-A integration | Open pending runtime |
| VL-003 localStorage token | Access token memory-only | localStorage E2E assertion | Pending full auth browser flow | Open pending runtime |
| VL-004–008 session lifecycle | Rotation, origin guard, 401 failures, durable revocation | Auth code + E2E lifecycle | Pending full production-like runtime | Open pending runtime |
| VL-009–013 financial integrity | Fixed-point arithmetic, bounds, DB aggregation, invoice uniqueness | Decimal + contract tests | Pending PostgreSQL integration | Open pending runtime |
| VL-014–017 contact/reviews | Server-owned contact/review contracts + moderation | E2E public/moderation coverage | Pending full preview E2E | Open pending runtime |
| VL-018–021 admin/settings/rate limits | DTOs, route contracts, durable limiter | E2E unauthorized/admin checks | Pending multi-instance/runtime test | Open pending runtime |
| VL-022 currency | Explicit single-currency USD policy | Static policy evidence | Pending UI-wide currency audit | Open pending runtime |
| VL-023 CI | Build/test/migration/Playwright gates added | Workflow source inspection | Workflow runs unavailable through connected GitHub tool | Open pending CI execution |
| VL-024 due date | Date-only contract + UTC-noon normalization | Contract test | Pending UI create/reload E2E | Open pending runtime |
| VL-025 admin identity | DB role + normalized email + reserved configured admin identity | Migration/static inspection | Pending role matrix E2E | Open pending runtime |
| VL-026 legal | Self-contained static pages | Static source inspection | Pending browser XSS/network assertions | Open pending runtime |
| VL-027 admin UI | Role-aware client guard | Static source inspection | Pending ordinary-user browser matrix | Open pending runtime |
| VL-028 API URL | Central fail-closed production config | Static source inspection | Pending production config smoke | Open pending runtime |
| VL-029 IDs | UUID params validated | Contract tests | Pending malformed-ID HTTP matrix | Open pending runtime |
| VL-030 review state | Server-backed pending/approved lifecycle | Moderation E2E source | Pending execution | Open pending runtime |
| VL-031 AI screening | Client-controlled screening removed | Static contact contract inspection | Pending contact integration | Open pending runtime |
| VL-032 outstanding receivables | Sent + Overdue exact SQL aggregation | Static service inspection | Pending financial fixture | Open pending runtime |
| VL-033 session bootstrap | Refresh returns authoritative user DTO | Static auth/frontend inspection | Pending hard-reload browser test | Open pending runtime |
| VL-012 N+1 | Batched invoice-item query | Static query inspection | Pending query-count/performance test | Open pending runtime |

## Current closure rule

The remediation branch is **not declared fully closed** while runtime/CI evidence remains unavailable. Source changes are documented, but a green source tree is not being substituted for execution evidence. `main` remains untouched.

### Production evidence captured from the untouched main deployment

On 2026-09-25, the connected Vercel backend production deployment `dpl_4j855rsQPKKE3qFsJBQvt4HMXTX3` (main / `ea65b9d...`) was queried directly:
- `GET /health` returned 200.
- `GET /api/public/reviews` returned 200 with an empty approved list.
- `GET /api/public/settings` returned 500.
- Vercel runtime logs identify the failing query as a read from `system_settings`.

This is direct production evidence for the migration/schema finding: the untouched main deployment is running code whose current schema expects `system_settings`, while the historical migration set did not create that table. The remediation adds `0007_current_schema_retrofit.sql`; it has **not** been applied to production because main and production must remain untouched during forensic remediation.

Vercel runtime error inspection for both VaultLedger projects showed no other runtime errors in the preceding 24 hours at the time of inspection. The specific `/api/public/settings` 500 is nevertheless a verified active production defect on main.
