# HiveQuote LLM onboarding

## What HiveQuote is

HiveQuote is a Utah-focused managed home-services exchange. Homeowners submit a project request; HiveQuote qualifies it and offers it to one verified, available contractor at a time. If that contractor does not respond within the service window, HiveQuote can rescue and reassign the request rather than distributing it as a shared lead.

## Current implementation truth

- Hedy is the authoritative backend/data/runtime.
- Next.js hosts the public experience.
- The current Hedy baseline is synthetic staging.
- Real contractor/admin authentication is not activated.
- Real intake, wallet funding, Stripe event processing, GHL callbacks, and Twilio callbacks currently fail closed.
- Operational mock/demo records are not a substitute for backend state.
- The old database/automation architecture is retired and must not be reintroduced.
- Existing exported legacy workflows that depended on the old database have been removed from the active branch.

## Product moat direction

The durable advantage is not merely exclusivity. It is verified contractor density plus closed-loop outcome data, response performance, routing intelligence, CRM/field-service integrations, and transaction history.

## Sequencing

1. Prove Hedy-native state, routing, crash recovery, replay safety, and auditability with synthetic staging tests.
2. Govern and activate contractor/admin identity and tenant boundaries.
3. Implement signed provider ingress and event deduplication.
4. Implement immutable financial ledger + authenticated Stripe funding/reconciliation.
5. Activate real intake and contractor workflows.
6. Validate full HQ-1 acceptance.
7. Request a separate production promotion approval.

Do not claim a feature is live because its UI exists. Distinguish coded, staged, validated, activated, and production.
