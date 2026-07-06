# HiveQuote — Monetization Strategy: Homeowner-Side Revenue & the Quarterback Model

Companion to `LAUNCH-PLAYBOOK.md`. Question under analysis: lead platforms
traditionally charge contractors — can HiveQuote profitably monetize
homeowners instead, or should a lead contractor "take charge" and assemble
trades on the homeowner's behalf?

**Verdict: don't flip the payer. Contractors stay the primary customer;
homeowners become a second, additive revenue layer; the contractor-led model
becomes a premium product tier (Project Quarterback), not a pivot.**

---

## Why homeowner-pays-primary fails

1. **Willingness to pay is asymmetric.** A $150 lead is 2–4% of job value —
   trivially rational for a contractor. Homeowners have been trained by
   Angi/Thumbtack/Google that matching is free; every major platform that
   tried charging homeowners for *matching* retreated. Homeowners pay for
   adjacent value only: assurance, project management, speed, financing.
2. **A paywall starves the funnel.** Leads are the inventory sold via the
   wallet debits in `lib/utils/routing.ts`. Charging at the form taxes the
   supply chain that feeds contractor revenue.
3. **It burns the underwriting moat.** `lib/stripe/client.ts` enforces
   product naming to keep a clean B2B "lead generation services" Stripe
   profile. Consumer payments mean consumer chargebacks — the
   `/admin/payments` monitor pauses onboarding at 0.75% dispute rate, and
   B2C chargeback rates routinely blow past that.

---

## Homeowner-side revenue streams (ranked by fit to what's built)

### 1. Hive Concierge — paid managed bidding ($99–$149 flat)
Homeowners pay to *not manage the process*. Free tier unchanged: one vetted
exclusive pro, fast. Paid tier: HiveQuote collects **three sealed bids**,
verifies licenses (DOPL flow, scenario 11), summarizes quotes, schedules.

- Brand-safe: preserves "never *unknowingly* shared." Contractors buy a
  distinct, labeled **bid-invite** at ~40% of PPL price, knowing it's a
  3-bid concierge job.
- Revenue per project: $99 homeowner fee + 3 discounted bid-invites ≈
  **$200–$500** vs. one $50–$375 lead today.
- Reuses the full qualification / routing / TCPA consent stack.

### 2. Financing affiliate at the WON moment (build first — near-zero cost)
Scenario 3 already tiers jobs by size; T2/T3 ($3k–$10k+) is exactly where
homeowners finance. Partner with Wisetack / Hearth / Acorn Finance
(~$200–$400 per funded loan) and inject the offer into the existing
verification SMS. Monetizes homeowners **without charging them**, and
financed homeowners approve bigger scopes → higher contractor close rates →
lead prices stay defensible.

### 3. Hive Home Plan — membership ($99–$199/yr)
Priority routing, seasonal maintenance reminders keyed to `trades.ts`
seasonality, dispute advocacy, waived rush fees. The economic engine:
**memberships manufacture predictable lead flow** — every seasonal reminder
that converts is subscription revenue *and* a wallet debit. Same homeowner
event, monetized twice.

### 4. Priority dispatch fee ($19–$29, emergency trades)
Burst pipe at 9 PM → homeowner pays a rush fee for guaranteed 15-minute
response, enforced by non-response / second-match logic (scenarios 2 & 12).
Small, pure margin, zero cannibalization of the free path.

### 5. Sponsored cost-guide content (slow burn)
Blog + trade landing pages become "Utah Project Cost Reports" with affiliate
embeds (financing pre-qual, warranties, insurance). Compounds with the SEO
investment already planned in the playbook.

---

## Project Quarterback — the contractor-led model

For multi-trade projects (kitchen remodel = cabinets + flooring + electrical
+ plumbing — four of the eleven trades):

1. Homeowner submits one **project lead** instead of four trade leads.
2. Route to a vetted **anchor contractor** at a 2–3× PPL premium
   ($400–$900). They quarterback the job and subcontract the other trades.
3. Incentivize (or require) subcontracting **inside the HiveQuote network**;
   take a **$25–$50 intra-network referral fee** per handoff. This monetizes
   contractor-to-contractor flow — something no incumbent lead platform does
   — and makes leaving the network expensive.

Economics of one kitchen-remodel submission:

| Stream | Today | Quarterback model |
|---|---|---|
| Lead sale | one $175 flooring lead | $600 project lead |
| Subcontract fees | — | 3 × $35 |
| Financing affiliate (on a $30k job) | — | ~$300 |
| **Total** | **~$175** | **~$1,000** |

The homeowner pays nothing and gets what they actually want on multi-trade
jobs: one accountable contractor, not four phone numbers.

---

## Sequencing (against the 90-day plan)

1. **Financing affiliate** — weeks, not months; it's a link in an existing
   SMS flow.
2. **Hive Concierge** — validates homeowner willingness-to-pay cheaply with
   a one-time flat fee before building anything subscription-shaped.
3. **Project Quarterback** — at ~15–20 active contractors; needs network
   density to subcontract into.
4. **Hive Home Plan membership** — last; recurring consumer billing is
   operationally heaviest and needs a reactivation email/SMS engine.

Invariants every stream must respect: no money transmission (platform never
holds homeowner→contractor funds), Stripe product naming rules, TCPA consent
logging on any new SMS touchpoint, and the exclusive-lead promise (shared
distribution only ever as a transparently labeled, opt-in product).
