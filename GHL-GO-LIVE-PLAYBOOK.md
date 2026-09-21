# GHL activation playbook — Hedy-native

**Status: deferred / fail closed.**

GHL is not currently an authoritative data store and its callbacks are not activated. Hedy remains authoritative.

Before GHL can be activated:

1. Define the exact Hedy contact/lead identifiers and remove legacy database-specific field names.
2. Implement signed/verified inbound provider handling where supported.
3. Create a provider-event inbox with stable event IDs, replay detection, and idempotent transitions.
4. Map GHL contact/pipeline fields to Hedy lead/job state without allowing GHL to overwrite protected routing, identity, or financial truth.
5. Prove duplicate/replayed/out-of-order event behavior in synthetic staging.
6. Prove failure handling and replay from the event inbox.
7. Activate credentials/secrets only under a separate governed approval.
8. Run staging canaries before any production request.

Until those gates pass, the Next.js GHL webhook endpoint intentionally returns an unavailable response and does not acknowledge processing.
