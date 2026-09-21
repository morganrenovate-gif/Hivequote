# HiveQuote Hedy-native migration

## Authority

Hedy is the authoritative backend platform for HiveQuote.

Approved synthetic staging baseline:

- Hedy project: `proj_c1a22627273d41dd8963e0058eb88f9d`
- Environment: `staging`
- Revision: `apprev_1789730721149_e2bb8d30a0d24711a3666ea96c40a0cb`
- Deployment: `appdep_1789730727924_4e99cb6682364f19a972a3e6cff22489`
- Manifest hash: `51af5c9da1a51e98a52094837729d67c6eeb10a71c672780d613e1a30729e788`
- Mode: synthetic staging only
- Auth, live payments, and production promotion: not activated

The checked-in `hedy/hedy.app.json` and `hedy/functions/*` mirror that immutable revision.

## Cutover status

The feature branch removes the superseded database SDK, schema, environment keys, and directly coupled automation exports. Operational admin, contractor, directory, intake, payment, and provider-callback surfaces fail closed rather than displaying fabricated state or returning mock success.

## Remaining activation sequence

1. Extend synthetic tests for concurrent routing, crash recovery, expiry/rescue/reassignment, no-match recovery, replay, and ledger idempotency.
2. Separately govern and activate Hedy contractor/admin auth and role/tenant boundaries.
3. Implement real Hedy intake, 72-hour dedup, consent evidence, suppression, and anti-abuse controls.
4. Implement signed GHL/Twilio provider ingress and event inbox/replay handling.
5. Implement immutable wallet/payment ledger and Stripe reconciliation.
6. Reconnect operational admin and contractor views to authenticated Hedy state.
7. Run the complete HQ-1 acceptance suite.
8. Request a separate production promotion approval.

## Safety rule

Unavailable capabilities fail closed. Do not return mock success, accept arbitrary credentials, acknowledge unverified callbacks, or expose fabricated lead/contractor/payment/consent state.
