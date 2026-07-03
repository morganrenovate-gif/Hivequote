# HiveQuote

**Utah's exclusive home services lead exchange.** One project, one vetted pro — never a shared lead.

Production Next.js platform implementing the Utah Home Services Lead Exchange blueprint (V2.0), rebranded HiveQuote.

## What's inside

| Area | Routes |
|---|---|
| Homeowner site | `/` home · `/[trade]` 11 SEO landing pages with multi-step TCPA lead form · `/how-it-works` · `/about` · `/blog` guides · `/directory` contractor profiles · `/privacy` (UCPA) |
| Contractor | `/for-contractors` pitch + pricing · `/contractor/apply` (capacity-gated) · `/contractor/login` · `/contractor/dashboard` (leads, billing/wallet, profile) |
| Admin | `/admin` daily audit · leads · contractors · payments (dispute-rate monitor) · disputes · monitoring · TCPA consent log |
| API | `/api/leads/submit` (zod + dedup + consent log + GHL sync) · `/api/leads/qualify` · `/api/contractors/apply` · `/api/contractors/wallet/topup` (Stripe ACH checkout) · webhooks: `stripe`, `ghl`, `twilio/delivery` (STOP suppression) · `/api/admin/stats`, `/api/admin/report` |
| Database | `supabase/schema.sql` — full V2.0 schema: 15 tables, dedup index, RLS, views, seed trades |

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

**Mock mode (default):** with no env vars set, everything runs on realistic demo data — every page and API works, nothing external is called.

**Go live:** copy `.env.example` → `.env.local`, then per integration:

1. **Supabase** — create project (Pro tier, $25/mo — free tier pauses and breaks automation), run `supabase/schema.sql` in the SQL editor, paste URL + keys.
2. **Stripe** — paste secret key + webhook secret. Product naming rule is enforced in `lib/stripe/client.ts`: never "success fee" / "referral fee" — those trigger underwriting review.
3. **GoHighLevel** — paste API key + location ID (Agency Unlimited, $297/mo).
4. **Twilio/SMS** — keep `SMS_ACTIVE=false` until A2P 10DLC registration is APPROVED. This is a hard compliance gate.

Deploy on **Vercel Pro** (60s function timeout needed for webhook chains).

## Blueprint invariants encoded in this codebase

- Leads are **exclusive** — one contractor per lead, enforced by routing logic (`lib/utils/routing.ts`)
- **Dedup**: same phone + trade within 72h is suppressed and never charged (DB unique index + app check)
- **TCPA**: consent language versioned; every submission logs IP, timestamp, form URL, exact text; STOP replies suppress globally
- **Capacity gate**: fully-booked contractor applicants are waitlisted, not onboarded
- **Payments**: contractor → platform only (no money transmission); ACH preferred; wallet pre-funding
- **Monitoring**: error_log table + daily audit endpoint; automation without monitoring is unattended failure
