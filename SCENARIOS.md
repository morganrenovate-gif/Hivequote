# HiveQuote workflow scenarios — Hedy-native target

Legacy database-coupled n8n exports are retired. The workflow requirements remain, but execution must be rebuilt on Hedy-native state and event primitives.

1. Lead intake → consent evidence → dedup → qualification.
2. Qualification → candidate selection → one contractor offer.
3. Offer accept/decline/expiry → assignment or rescue/reassignment.
4. Contractor job status updates → outcome verification.
5. Provider event inbox → signature verification → replay-safe processing.
6. Payment funding/reconciliation → immutable ledger events.
7. Delivery/suppression handling for messaging providers.
8. Non-response monitoring and capacity pause.
9. Contractor performance/reporting from authoritative Hedy state.
10. License/compliance refresh.
11. Daily audit/error review.
12. Dispute/credit workflow with evidence and audit trail.

No workflow may mutate real customer, contractor, or financial state until its identity, provider verification, idempotency, and governance gates are active.
