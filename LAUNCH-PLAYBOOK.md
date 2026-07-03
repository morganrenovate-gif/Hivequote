# HiveQuote Launch Playbook

Sequenced from the V2.0 blueprint. Budget required before Day 1: **$500–$1,000**
(covers ~60 days before first revenue; fixed costs run $376–$446/month from
Day 31). Everything below is ordered by dependency — do it in this order.

---

## Day 1 — The one thing that gates everything else

**☐ Start A2P 10DLC registration (Task 0.1).** Approval takes 2–6 weeks and
no SMS can legally send until it clears. Sequence:
1. Form the LLC first (registration requires a legal entity + EIN): Utah
   Division of Corporations, ~$59. Get EIN free at irs.gov same day.
2. Open a business bank account (Stripe and A2P both want it).
3. In GHL (or Twilio direct): submit brand registration (LLC name, EIN,
   address, website — the site must be live or use a landing page) and
   campaign registration (use case: customer care + lead follow-up; include
   the exact opt-in language from the site form and STOP handling).
4. Set `SMS_ACTIVE=false` and leave it false until approval. The platform is
   built to run email-only in the interim.

## Days 1–3 — Accounts and deploy

**☐ Domain:** buy hivequote.com (+ .co defensively).
**☐ Supabase Pro ($25/mo):** create project → SQL editor → run
`supabase/schema.sql` → copy URL, anon key, service-role key.
**☐ Vercel Pro ($20/mo):** import the repo → add all `.env.example` vars →
deploy → point domain. Pro is required (60s function timeout for webhooks).
**☐ Stripe:** activate account as "lead generation services" (B2B, contractors
pay the platform — clean underwriting profile). Create products using ONLY the
approved names: "Lead Generation Service — [Trade]", "Lead Generation
Subscription — [Tier]", "Contractor Platform Setup Fee", "Lead Wallet —
HiveQuote". Add webhook → `https://hivequote.com/api/webhooks/stripe`.
**☐ GHL Agency Unlimited ($297/mo, 14-day trial first):** create location,
provision Twilio number inside GHL, build the qualification workflow +
pipelines (stages: New → Qualifying → Qualified → Assigned → Contacted →
Won/Lost/Nurture).
**☐ n8n ($6/mo DigitalOcean droplet):** follow `automation/README.md`, import
the 5 workflows, wire webhook URLs into GHL.

## Days 3–7 — Contractor outreach (revenue starts here, not with SEO)

**☐ Text your existing network first.** You have relationships in epoxy,
courts, electrical, plumbing, excavation, cabinets, flooring, framing,
concrete. Script:

> "Hey [Name] — I'm launching HiveQuote, a Utah-only lead platform. Exclusive
> leads (never shared with competitors), you only pay for qualified homeowners
> ready to start in 30 days, no contract. I'm taking 5 founding contractors at
> locked-in pricing. Want the details?"

**☐ Founding cohort targets:** 5 contractors across anchor trades
(electrician, plumber, flooring ×2, epoxy). $97 setup fee each (waive only for
1–2 anchors with 100+ Google reviews). Capacity-gate everyone — fully booked
goes to the waitlist.
**☐ Contractor agreement:** have a Utah attorney review before first
signature (~$300–$500 one-time). Must include: exclusive-lead definition,
48-hour dispute window / 72-hour resolution, PPC ACH authorization language
(for later opt-in), seasonal volume adjustment for seasonal trades, no-poach
consideration.
**☐ Referral engine:** $50 per referred contractor who signs and buys their
first lead package.

## Weeks 2–6 — Traffic (in ROI order)

1. **Facebook groups** — with the account-protection protocol: warm personal
   profile, 10 helpful comments per 1 business mention, never post direct
   links (brand name + "DM me"), get admin permission first, keep a warmed
   backup account, keep Ads Manager on a separate account.
2. **Nextdoor** — business profile per sub-brand, weekly posts, answer every
   recommendation request in service areas.
3. **KSL Classifieds** — 1 post/trade/week. Recruitment + awareness only;
   never represent KSL as a lead source (their ToS prohibits lead resale).
4. **Google Business Profile** — start Week 2, expect 4–6 weeks of video
   verification pain for a service-area business. If it stalls: UPS Store
   address ($15–30/mo) or lean on LSAs. Budget zero GBP traffic until Day 60+.
5. **Blog/SEO** — already live on the site (3 seed guides). 1 post/trade/week
   from Phase 2. Treat SEO as a 6–12 month payoff, not launch traffic.

## Launch gates — do not open public traffic until ALL are checked

- ☐ LLC + EIN + business bank account
- ☐ Privacy policy live (it is: /privacy) and contractor agreement reviewed by counsel
- ☐ Supabase schema deployed, daily audit email arriving at 7 AM MT
- ☐ Lead form → Supabase → GHL pipeline tested end-to-end with your own phone
- ☐ Error handler tested (force a failure; confirm founder SMS/email fires)
- ☐ 3+ contractors active with funded wallets in at least 2 anchor trades
- ☐ A2P status known; SMS_ACTIVE matches it
- ☐ Stripe dispute-rate monitor visible in /admin/payments

## Weekly operating rhythm (post-launch)

- **Daily (2 min):** read the 7 AM audit email. Unrouted leads or errors → fix same day.
- **Mon:** review contractor acceptance rates; call anyone slipping.
- **Wed:** outreach — 5 new contractor conversations.
- **Fri:** Stripe dispute rate check (<0.5%); pause onboarding if >0.75%.
- **Sunday:** weekly report review; adjust lead pricing only with 30-day data.

## The 90-day scoreboard

| Milestone | Target |
|---|---|
| Founding contractors signed | 5 by Day 14 |
| First paid lead delivered | Day 21–30 |
| Active contractors | 15–20 by Day 90 |
| Monthly revenue | $8k–$10k by Day 90 (spring launch) |
| Retainer conversions | 3+ by Day 90 (this is the path to $25k+) |

Anchor trades (electrician, plumber, cabinets, flooring) are the foundation;
seasonal trades are peak-season margin. Pre-sell spring leads at 10% off in
Jan–Feb to smooth winter.
