# HiveQuote

HiveQuote is a Utah-focused managed home-services exchange: one qualified homeowner request is offered to one verified, available contractor at a time, with response-or-reassignment handling instead of shared-lead blasting.

## Current architecture

- **Public UI:** Next.js.
- **Authoritative backend:** Hedy.
- **Current Hedy environment:** synthetic staging only.
- **Contractor/admin auth:** not activated yet.
- **Real lead intake:** fail closed until the governed Hedy intake path is activated.
- **Payments:** fail closed until authenticated Hedy identity, an immutable ledger, Stripe reconciliation, and a separate approval are in place.
- **Provider webhooks:** fail closed until signed/idempotent Hedy ingress is activated.
- **Operational demo data:** removed from admin, contractor dashboard, and public contractor directory.

The exact current Hedy staging manifest and function source are checked into `hedy/`.

## Safety rule

An unavailable integration must return an unavailable/error state. HiveQuote must never substitute fabricated success, arbitrary demo credentials, fake contractor/payment/lead state, or an unverified webhook acknowledgement.

## Development

```bash
npm install
npm run build
```

See `docs/HEDY-NATIVE-MIGRATION.md` for the migration boundary and remaining activation gates.
