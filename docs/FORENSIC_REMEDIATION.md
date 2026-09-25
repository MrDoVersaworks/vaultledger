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

GitHub status on the current remediation tip reported Vercel failures caused by the Vercel build-rate-limit target, not a reported TypeScript/build error. Therefore deployment/build verification is not yet closed.

## Explicitly open / not yet closed

- Distributed/persistent rate limiting across auth/contact/public review paths. **Implemented; CI migration/E2E verification pending.**
- Persistent refresh/access-token revocation semantics. **Access-token revocation is now persistent; refresh-token rotation still needs concurrent-reuse runtime verification.**
- Full migration/snapshot validation against a real PostgreSQL database, including duplicate-email failure behavior. **CI database migration is now wired; duplicate-email migration behavior still needs a targeted fixture test.**
- Complete API contract reconciliation across every frontend/backend endpoint.
- Full billing/subscription, external-integration, worker/scheduler, recovery/fallback, and persistence review required by the audit handoff.
- Runtime integration tests for login -> refresh rotation -> logout, admin denial/allowance, public review moderation, contact delivery, and invoice arithmetic. **E2E suite is wired; authenticated runtime paths still need dedicated seeded-user coverage.**
- Deployment/package verification after the current Vercel rate-limit block clears.

## Closure rule

This document is intentionally marked OPEN. No finding is considered closed merely because code was changed. Closure requires positive defect evidence plus regression/preservation evidence.
