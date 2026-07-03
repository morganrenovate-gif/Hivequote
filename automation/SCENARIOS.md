# HiveQuote — Complete Automation Scenario Spec (12 scenarios)

Scenarios 1, 3, 6, 12 (+ global error handler 00) ship as importable n8n JSON
in `n8n/`. The rest are specified here for fast build-out. Universal rules:
webhook triggers for anything routing-critical, error handler on every
workflow, SMS gate (`config.sms_active` + `sms_suppression`) before every send.

## 1. Lead Qualification → Routing ✅ exported
GHL webhook (tag `qualified`) → mark lead `routing` → match contractors by
trade + ZIP (exclusive zone first, then load balance) → create assignment →
PPL wallet debit + payment record → contractor SMS (gated) + email → mark
`assigned` → audit event. No match → `routing_failed`, founder alert, 24h
hold queue.

## 2. Contractor ACCEPT Reply Handler
GHL webhook (inbound SMS "ACCEPT") → find open assignment for that contractor
phone → set `contractor_accepted_at = NOW()` → reset
`consecutive_non_response_count = 0` → confirmation SMS to homeowner ("Your
pro [Name] is on it — expect a call within 2 hours"). If no ACCEPT in 30 min →
reminder SMS; at 60 min → offer to second-match contractor and note the miss.

## 3. Contractor Job Status Handler ✅ exported
WON → `won_unverified` + verification tier by job size (T1 <$3k: homeowner SMS
confirm; T2 $3k–$10k: + photo/address from contractor; T3 >$10k: + permit or
signed estimate) → homeowner YES → `won_verified`, Stripe ACH pull if PPC,
review request. Homeowner NO → dispute record, freeze PPC, notify founder.
No homeowner reply in 24h → one follow-up → `won_unverified_timeout`, do NOT
charge. LOST → log. PENDING → re-ping in 7 days.

## 4. Homeowner Satisfaction Survey Handler
GHL webhook (inbound number reply 1–5 to Day-7 survey) → score 4–5: trigger
Google review request with the contractor's review link → score 1–3: insert
`disputes` record, SMS founder with dispute link, open GHL conversation.

## 5. Stripe Payment Webhook Handler
Already implemented in the app at `/api/webhooks/stripe` (wallet credit on
checkout completion, retainer payment records, failure → error_log). Point
Stripe's webhook endpoint there; no separate n8n scenario needed unless you
want duplicate alerting.

## 6. Daily Lead Audit Report ✅ exported
Cron 7 AM MT → 24h metrics (received/routed/unrouted, acceptances, delivery
failures, unresolved errors) → HTML email to founder → SMS escalation if
unrouted >20% or unresolved errors >3.

## 7. Weekly Reporting
Cron Sunday 8 AM MT → 7-day rollup: leads by trade, delivered, accepted,
won/lost/pending, revenue by payment_type (`monthly_revenue` view), wallet
balances → HTML email to founder.

## 8. Contractor Wallet Low-Balance Alert
Supabase trigger or hourly check: `wallet_balance_cents <
wallet_threshold_cents` → SMS/email contractor with Stripe top-up link
("Lead Wallet — HiveQuote") → log. Repeat max once per 48h per contractor.

## 9. Month-End Contractor Report + Reset
Cron 1st of month 5 AM MT → per active contractor: leads received, contact
rate, close rate, fees paid (+ seasonal multiplier note for seasonal trades) →
email from GHL → reset `leads_delivered_this_month = 0`, apply retainer
rollover credits where guaranteed volume was missed.

## 10. A2P SMS Gate
Not a workflow — an inline check embedded in every SMS step (already present
in exported workflows): `config.sms_active = 'true'` AND recipient not in
`sms_suppression`, else email fallback + `sms_blocked_a2p_pending` log entry.

## 11. Contractor License Verification (Monthly)
Cron 1st of month 6 AM MT → all active contractors in licensed trades →
verify against DOPL (https://secure.utah.gov/llv/search — no public API;
use HTTP fetch + parse, or founder manual-verify queue with checklist email)
→ update `license_status`, `license_verified_at` → not active: pause
contractor, suspend routing, notify founder + contractor, log to
`contractor_events`.

## 12. Non-Response Monitoring ✅ exported
Cron 8 AM MT → assignments unaccepted >60 min → increment contractor
non-response count → at 3: pause contractor, suspend routing, founder email,
`contractor_events` log. Re-route in-flight leads to backup contractors.

---

### GHL-side configuration these scenarios expect
- Workflow "New Lead Qualification": on contact create with tag `new_lead` →
  qualification SMS (only when SMS active) → YES reply adds tag `qualified` →
  GHL webhook action → n8n scenario 1 URL, payload: `supabase_lead_id`,
  `trade_slug`, `zip_code`, `project_type`, `contractor_ghl_contact_id`.
- Inbound SMS keyword triggers: ACCEPT → scenario 2 URL; WON/LOST/PENDING →
  scenario 3 URL; numeric 1–5 → scenario 4 URL.
- STOP handling: Twilio webhook already wired to
  `/api/webhooks/twilio/delivery` (global suppression).
