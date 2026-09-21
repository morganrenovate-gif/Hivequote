# HiveQuote launch playbook

**Current status: not launch-ready. HQ-1 Hedy-native foundation is still being validated.**

## Required before launch

- Hedy contractor and admin authentication with correct tenant/role boundaries.
- Real contractor records, service areas, capacity, and verification state.
- Real intake with 72-hour dedup semantics and immutable consent evidence.
- Signed/idempotent GHL and Twilio ingress.
- Immutable payment/event ledger and authenticated Stripe funding/reconciliation.
- One-at-a-time offer, acceptance, expiry, rescue/reassignment, and no-match recovery.
- Replay/concurrency/crash-recovery tests.
- No fabricated operational data or mock-success API behavior.
- Complete auditability and rollback evidence.
- Production promotion approval.

## Explicitly not authorized by the HQ-1 staging work

- Live payment movement.
- Production promotion.
- Customer-data migration.
- Auth/permission activation.
- Secrets/API keys/OAuth provisioning.
- Domains/DNS changes.
- External outreach or messaging.

Launch only after the full acceptance gate is proven in staging and production promotion receives its own approval.
