# HiveQuote Hedy-native migration

Hedy is the authoritative backend for HiveQuote. Supabase is superseded and must not be reintroduced.

Approved staging baseline:
- Project: `proj_c1a22627273d41dd8963e0058eb88f9d`
- Revision: `apprev_1789730721149_e2bb8d30a0d24711a3666ea96c40a0cb`
- Deployment: `appdep_1789730727924_4e99cb6682364f19a972a3e6cff22489`
- Manifest hash: `51af5c9da1a51e98a52094837729d67c6eeb10a71c672780d613e1a30729e788`
- Mode: synthetic staging only
- Auth, live payments, production promotion: not activated

Migration rules:
1. Unimplemented operational capabilities fail closed.
2. Never return mock success, accept arbitrary credentials, acknowledge unverified webhooks, or expose fabricated operational state.
3. Public marketing may remain in Next.js. Authenticated contractor/admin operations move to Hedy after a separate auth/permission approval.
4. Remove Supabase only after direct code verification finds no remaining operational callers.
5. Production promotion is a separate governed action.

Until later gates are approved, real intake, contractor onboarding/login, wallet funding, provider webhooks, and admin operational data intentionally remain unavailable.
