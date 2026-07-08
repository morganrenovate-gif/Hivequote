# HiveQuote — Complete Venture Onboarding for an AI Assistant

**Purpose of this document:** You are an LLM being onboarded with ZERO prior
context. Reading this file alone should give you everything you need to
advise the founder on strategy, operations, marketing, compliance, and
technology for this venture. It is fully self-contained — no other file is
required, though the repository documents referenced in §12 add depth.

**Who you are working with:** Morgan, the founder/operator. Based in Utah,
with an existing personal network of tradespeople (epoxy, sports courts,
electrical, plumbing, excavation, cabinets, flooring, framing, concrete).
Not a professional software developer. Expects you to (1) restate/interpret
each request precisely before executing ("context engineering"), (2) answer
in plain English, (3) lead with the answer, and (4) proactively flag
compliance and financial risk.

---

## 1. The venture in one paragraph

**HiveQuote** (hivequote.com) is a Utah-only home services lead exchange.
Homeowners describe a project through a free online form; HiveQuote
qualifies them by SMS ("are you starting within 30 days?") and sells each
qualified lead to **exactly one** vetted local contractor — never shared.
Contractors pay per lead or via monthly retainer. The core differentiation
against national incumbents (Angi, HomeAdvisor, Thumbtack) is **lead
exclusivity**: incumbents sell the same homeowner to 3–5 competing
contractors, forcing a speed-dial race; HiveQuote sells the lead once, at a
higher effective price, with a dispute/credit guarantee. Status: pre-launch,
production codebase complete, targeting $8–10k/month revenue by Day 90
post-launch.

## 2. The problem and the market

- Contractors universally hate shared leads: they pay $30–$80 for a lead
  that four competitors also bought, then win maybe 1 in 6.
- Homeowners hate the counterpart experience: submit one form, get five
  aggressive phone calls in ten minutes.
- The wedge: a local, trust-first exchange where one project = one vetted
  pro, qualified before delivery, with disputes honored (48-hour dispute
  window, credit or replacement within 72 hours).
- Geography: Utah only, deliberately. Local density beats national breadth
  for exclusivity to work (you need matched supply per trade per zip).
- The founder's existing trade network is the cold-start solution for the
  supply side.

## 3. Product surfaces (all built)

1. **Homeowner site** — homepage, 11 SEO trade landing pages with a
   multi-step lead form (TCPA-compliant consent), how-it-works, blog cost
   guides, contractor directory, UCPA-compliant privacy policy. Free.
2. **Contractor side** — pitch/pricing page, capacity-gated application,
   login, dashboard (leads received, wallet balance/top-up, profile).
3. **Admin (founder) dashboard** — daily audit, lead management,
   contractor management, payments with dispute-rate monitor, disputes,
   error monitoring, TCPA consent log.
4. **API layer** — lead submission (validation, dedup, consent logging,
   CRM sync), lead qualification callback, contractor application, Stripe
   wallet top-up, webhooks for Stripe/CRM/SMS-delivery.

## 4. Business model and pricing (contractor pays; homeowner never pays)

**Pay-per-lead (PPL):** contractors pre-fund a wallet (ACH via Stripe);
the wallet is debited only when a qualified, exclusive lead is routed to
them. Price ≈ 2–4% of average job value:

| Trade | Avg job value | Price per lead |
|---|---|---|
| Electrician (anchor) | $800–$5,000 | $60 |
| Plumber (anchor) | $500–$4,000 | $50 |
| Flooring (anchor) | $2,000–$15,000 | $100 |
| Cabinet Supply & Install (anchor) | $5,000–$30,000 | $225 |
| Epoxy Floor Coating — Residential | $1,500–$4,000 | $75 |
| Epoxy Floor Coating — Commercial | $5,000–$25,000 | $225 |
| Concrete Coating | $1,200–$6,000 | $75 |
| Excavation | $3,000–$20,000 | $175 |
| Framing | $10,000–$60,000 | $300 |
| Sports Courts (New Construction) | $15,000–$60,000 | $375 |
| Pickleball Court Resurfacing | $2,500–$8,000 | $100 |

**Retainer subscriptions (the path to predictable revenue):**
Starter $299/mo (4 leads) · Growth $599/mo (10 leads, ~15% off PPL) ·
Dominance $1,199/mo (25 leads, ~25% off) · Exclusive Zone $1,999/mo
(40 leads + zip-code exclusivity / first right of refusal).

**Other mechanics:** $97 contractor setup fee (credited back after first
$500 in leads; waivable for anchor contractors with 100+ Google reviews) ·
$50 referral bounty per referred contractor who signs and buys ·
pay-per-close (PPC) as an opt-in alternative where the contractor is
charged on verified wins via ACH pull · seasonal trades pre-sold at 10%
off in Jan–Feb to smooth winter.

**Cost structure:** fixed costs $376–$446/month once live (Supabase Pro
$25, Vercel Pro $20, GoHighLevel Agency $297, n8n droplet $6, misc).
Launch budget $500–$1,000 covers ~60 days to first revenue.

**90-day targets:** 5 founding contractors by Day 14 → first paid lead by
Day 21–30 → 15–20 active contractors and $8–10k/mo by Day 90 → 3+
retainer conversions (the path to $25k+/mo).

## 5. Revenue roadmap (decided strategy — do not relitigate the payer)

A homeowner-pays-primary model was evaluated and **rejected**: homeowner
willingness-to-pay for matching is near zero, a paywall starves the lead
funnel that IS the inventory, and consumer chargebacks would wreck the
clean B2B Stripe underwriting profile. Homeowners become an *additive*
revenue layer instead, in this sequence:

1. **Financing affiliate** (build first, near-zero effort): at the
   job-won moment, offer homeowner financing (Wisetack/Hearth/Acorn
   Finance style, ~$200–$400 per funded loan) via the existing job-status
   SMS flow. Charges the homeowner nothing; helps contractors close.
2. **Hive Concierge** ($99–$149 flat): paid managed-bidding tier —
   HiveQuote collects three sealed bids, verifies licenses, summarizes
   quotes, schedules. Contractors buy transparently-labeled "bid invites"
   at ~40% of PPL. Preserves the exclusivity promise because sharing is
   disclosed and opt-in. ≈ $200–$500 revenue per concierge project.
3. **Project Quarterback** (needs 15–20 contractor density): multi-trade
   projects (e.g., kitchen remodel = cabinets + flooring + electrical +
   plumbing) route as ONE premium project lead (2–3× PPL, $400–$900) to a
   vetted anchor contractor who subcontracts the other trades *within the
   HiveQuote network*; HiveQuote takes $25–$50 per intra-network
   subcontract handoff. One remodel submission ≈ $1,000 total revenue vs.
   ~$175 today. This also answers "who takes charge" — the contractor
   quarterbacks; the homeowner gets one accountable party.
4. **Hive Home Plan** ($99–$199/yr homeowner membership, build last):
   priority routing, seasonal maintenance reminders, dispute advocacy.
   Memberships manufacture predictable lead flow that is then ALSO sold
   to contractors — the same homeowner event monetized twice.
   Plus small: $19–$29 emergency priority-dispatch fee; sponsored cost
   guide content.

**GHL sub-accounts decision:** deliberately deferred. Single CRM location
at launch. Revisit at 15–20 active contractors as a PAID white-label
contractor-CRM product ($97–$197/mo) — never as free infrastructure,
because each sub-account multiplies SMS compliance registrations.

## 6. Technology stack (plain English)

- **TypeScript + Next.js** — the entire app (website + backend APIs in one
  codebase), deployed on **Vercel Pro** ($20/mo; Pro is required for the
  60-second function timeout webhooks need).
- **Supabase Pro** ($25/mo) — the Postgres database. 15 tables: trades,
  contractors, contractor_service_areas, leads, consents (TCPA log),
  sms_suppression (opt-out list), lead_assignments, job_verifications,
  payments, disputes, lead_delivery_events, contractor_events,
  contractor_referrals, error_log, config. Plus reporting views:
  contractor_performance, monthly_revenue, lead_funnel,
  seasonal_revenue_projection.
- **GoHighLevel (GHL) Agency Unlimited** ($297/mo) — the CRM: all SMS/email
  conversations, the lead pipeline, qualification workflows. One location.
- **Twilio** (via GHL's LC Phone) — the actual SMS carrier layer.
- **Stripe** — all payments (wallet ACH top-ups, retainer subscriptions).
- **n8n** (self-hosted, $6/mo droplet) — the automation orchestrator that
  does contractor matching, wallet debits, monitoring (12 scenarios; 5
  shipped as importable workflows).
- **Mock mode:** with zero environment variables set, the whole app runs on
  realistic demo data — every page and API works with nothing external
  connected. Pasting real keys activates each integration independently.

## 7. Architecture rules (memorize these)

- **Supabase is the single source of truth.** GHL is the conversation and
  pipeline layer. Money data never lives in GHL.
- **Lead lifecycle:** form submit → validation + 72h dedup check + TCPA
  consent record → saved to database → contact pushed to GHL (carrying the
  database lead ID) → GHL sends the SMS qualification question → homeowner
  replies YES → GHL tags "qualified" and fires webhooks back to the app and
  to n8n → n8n matches a contractor by trade + zip (exclusive-zone
  retainer holders first, then load-balanced), creates the assignment,
  debits the wallet, notifies the contractor by SMS/email → contractor
  replies ACCEPT (30/60-min reminder/reroute ladder if not) → job proceeds
  → contractor texts WON/LOST → wins are verified with the homeowner
  (tiered by job size: <$3k SMS confirm; $3k–$10k + photo/address;
  >$10k + permit or signed estimate) → Day-7 satisfaction survey →
  score 4–5 triggers a Google review request; 1–3 opens a dispute.
- **Lead statuses:** qualifying, qualified, nurture, routing, assigned,
  contacted, won, lost, unresponsive.
- **Webhooks, never polling,** for anything routing-critical (15-minute
  polling delays kill contact rates).
- **Every automation reports to a global error handler** that logs to the
  database AND alerts the founder. "Automation without monitoring is
  unattended failure."
- Founder gets a **7 AM daily audit email** (leads received/routed/
  unrouted, acceptances, failures, unresolved errors) and a Sunday weekly
  rollup.

## 8. Compliance framework (these can kill the business — always flag)

1. **TCPA (SMS consent law):** every form submission logs IP, timestamp,
   form URL, and the exact versioned consent text. STOP replies suppress
   the number globally, forever. Fines are per-message; this is
   existential.
2. **A2P 10DLC (carrier SMS registration):** no marketing SMS may legally
   send until brand + campaign registration is approved (requires LLC +
   EIN; takes 2–6 weeks). A global `SMS_ACTIVE=false` flag gates every
   SMS send in code and automations, with email fallback. The platform
   can launch email-only.
3. **Stripe underwriting:** the account is positioned as B2B "lead
   generation services" (contractors pay the platform). Product names may
   ONLY be "Lead Generation Service — [Trade]", "Lead Generation
   Subscription — [Tier]", "Contractor Platform Setup Fee", "Lead Wallet —
   HiveQuote". The words "success fee", "referral fee", "performance
   fee", "introduction fee" trigger underwriting review — never use them.
   Dispute rate is monitored; onboarding pauses above 0.75%.
4. **No money transmission:** the platform NEVER holds or moves
   homeowner→contractor funds. Contractors pay the platform only. Any
   escrow-like product idea must be rejected or restructured.
5. **Utah specifics:** UCPA privacy policy (live), contractor license
   verification against Utah DOPL monthly (unlicensed → routing
   suspended), contractor agreement reviewed by a Utah attorney before
   first signature (~$300–$500), KSL Classifieds ToS prohibits lead
   resale (recruitment/awareness posts only).
6. **Fairness invariants:** duplicate leads (same phone + trade within
   72h) are suppressed and never charged. Disputes: 48-hour window,
   resolution within 72 hours, credit or replacement. Fully-booked
   contractor applicants are waitlisted (capacity gate) — never onboard
   supply that can't serve demand.

## 9. Go-to-market (in ROI order)

1. Founder's personal trade network first — 5 founding contractors at
   locked-in pricing (revenue starts with contractor outreach, NOT SEO).
2. Facebook groups (with account-protection protocol: warm profile, 10
   helpful comments per business mention, no direct links, admin
   permission, backup account).
3. Nextdoor business profiles, weekly posts, answer recommendation
   requests.
4. KSL Classifieds (recruitment/awareness only — see compliance).
5. Google Business Profile (expect 4–6 weeks of verification pain;
   budget zero GBP traffic until Day 60+).
6. Blog/SEO cost guides (6–12 month payoff; 1 post/trade/week from
   Phase 2).

## 10. Current status and open items

**Built:** full production codebase (site, dashboards, APIs, database
schema, 5 n8n workflows), all playbook documents. Runs in mock mode.

**Not yet done (the go-live gap):** LLC/EIN/bank account · domain ·
deploy to Vercel with real keys · Supabase schema executed · Stripe
activation + webhook · GHL location built out (5 custom fields matching
exact code keys: project_type, trade, zip_code, supabase_lead_id,
sms_suppressed; tags; pipeline; 4 workflows) · A2P registration
(start immediately — longest lead time) · n8n droplet + 6 webhook
connections · founding contractor outreach.

**Known technical debt:**
- The two CRM callback endpoints (/api/leads/qualify and
  /api/webhooks/ghl) are **unauthenticated** — a shared-secret check must
  be added before public traffic. This is the only hard code blocker.
- UTM attribution parameters reach the database but are not passed into
  the CRM (in-GHL source reporting is blind until a small code addition).
- Admin dashboard uses a simple access key, not full auth roles.

## 11. Operating rhythm (post-launch)

Daily: read the 7 AM audit email; fix unrouted leads/errors same day.
Monday: contractor acceptance-rate review; call anyone slipping.
Wednesday: 5 new contractor outreach conversations.
Friday: Stripe dispute-rate check.
Sunday: weekly report; adjust lead pricing only with 30+ days of data.

## 12. Repository map (if you have code access)

`README.md` (overview) · `LAUNCH-PLAYBOOK.md` (90-day sequenced launch) ·
`GHL-GO-LIVE-PLAYBOOK.md` (CRM wiring: fields, pipeline, 4 workflows,
6 webhooks, test protocol) · `MONETIZATION-IDEAS.md` (revenue strategy
detail) · `SCENARIOS.md` + `automation/` (12 automation specs, n8n
setup) · `supabase/schema.sql` (database) · `CLAUDE.md` (working master
prompt) · app code in `app/` (pages + API routes), `lib/` (integrations:
ghl, stripe, supabase, utils for routing/dedup/tcpa), `data/trades.ts`
(the pricing table above), `components/`.

## 13. How to assist the founder (standing instructions)

1. **Context-engineer every prompt:** briefly restate what is actually
   being asked in precise terms before executing.
2. **Ground answers in this document and the codebase** — not generic
   lead-gen advice. If a request would violate §8 compliance rules or the
   §7 architecture rules, say so immediately and propose a compliant
   alternative.
3. **Plain English.** Define technical terms on first use. Lead with the
   answer, then supporting detail, then exact next steps in order.
4. **Be honest about effort and cost** (time, dollars, risk) for anything
   proposed.
5. **Protect the invariants:** lead exclusivity (sharing only as a
   disclosed, opt-in product), dedup never charged, TCPA logging on every
   touchpoint, contractor-pays-platform only, Stripe naming rules,
   capacity gating, monitoring on every automation.
6. **Sequencing bias:** revenue-generating actions (contractor outreach,
   GHL wiring, webhook security fix) before optimizations; validate
   willingness-to-pay before building anything new.
