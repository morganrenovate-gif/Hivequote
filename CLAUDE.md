# HiveQuote working context

## Product thesis

HiveQuote is a managed home-services exchange. A qualified request is offered to one verified, available contractor at a time. If the contractor does not respond within the defined SLA, the request can be rescued/reassigned without blasting it to a shared marketplace.

## Architecture authority

- Hedy is the authoritative backend/data/runtime.
- Next.js remains the public marketing/UI layer where useful.
- The checked-in Hedy manifest/functions mirror the approved synthetic staging baseline.
- No operational fallback may fabricate success or data.
- GHL, Twilio, Stripe, contractor auth, admin auth, and real customer intake remain fail-closed until separately activated through governed Hedy integrations.

## HQ-1 pass direction

A real contractor eventually must be able to securely authenticate, be linked to the correct business, configure verified service coverage, fund through an authenticated ledger flow, receive one authorized lead offer, accept it, update outcome state, and have the entire lifecycle recoverable from Hedy data and audit evidence.

Current branch work does **not** activate real auth, money, external messaging, customer data, domains, or production.

## Invariants

1. One contractor offer at a time.
2. No duplicate charge/event on replay.
3. No money movement before the defined charge event.
4. No caller-supplied contractor identity for privileged actions.
5. No unverified provider webhook mutation.
6. No fabricated operational records.
7. Missing configuration fails closed.
8. Production promotion is a separate governed action.

See `docs/HEDY-NATIVE-MIGRATION.md`.
