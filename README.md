# HiveQuote Automation Layer (n8n)

Implements Section 5.3 of the blueprint. n8n self-hosted is the recommended
orchestrator ($6/mo DigitalOcean droplet, unlimited operations, <1s webhooks).

## Non-negotiable conventions (V2.0)

1. **Webhook triggers only for routing.** GHL fires webhooks on pipeline/tag
   changes. Scheduled polling is prohibited for lead routing — 15-minute
   delays kill contact rates.
2. **Every workflow points at the global error handler** (`00-error-handler.json`),
   which logs to Supabase `error_log` AND texts the founder. Automation
   without monitoring is unattended failure.
3. **SMS gate before every send:** check `config.sms_active = 'true'` AND the
   recipient is not in `sms_suppression`. If gated → send email instead and
   log `sms_blocked_a2p_pending`.
4. All SMS comes from the platform's A2P-registered number. Never a
   contractor's personal phone.

## Files

| File | Scenario | Trigger |
|---|---|---|
| `n8n/00-error-handler.json` | Global error handler | n8n Error Trigger |
| `n8n/01-lead-qualification-routing.json` | Qualified lead → contractor match → wallet debit → notify | GHL webhook |
| `n8n/03-job-status-handler.json` | WON/LOST/PENDING replies + PPC verification tiers | GHL webhook |
| `n8n/06-daily-audit-report.json` | Founder's daily 7 AM MT audit email | Cron |
| `n8n/12-non-response-monitoring.json` | Pause contractors after 3 consecutive non-accepts | Cron |
| `SCENARIOS.md` | Full spec for all 12 scenarios (incl. those not yet exported) | — |

## Setup

1. Spin up n8n: Ubuntu 22.04 droplet → Docker → `docker run -d --restart unless-stopped -p 5678:5678 -v n8n_data:/home/node/.n8n n8nio/n8n` → Nginx + Let's Encrypt for HTTPS.
2. Create credentials in n8n named exactly:
   - `Supabase Postgres` (Postgres credential → Supabase connection string, **port 6543 Supavisor transaction pooler**)
   - `Stripe API` (Stripe credential, secret key)
   - `GHL API` (HTTP Header Auth: `Authorization: Bearer <key>`)
   - `SMTP` (email send)
3. Import each JSON via n8n → Workflows → Import from File.
4. In n8n Settings → set `00-error-handler` as the default error workflow.
5. Copy each webhook URL into the matching GHL workflow webhook action.
6. Activate workflows only after the Supabase schema is live.
