# HiveQuote — GHL Go-Live Playbook

Companion to `LAUNCH-PLAYBOOK.md`. Scope: everything required to go live with
GoHighLevel as the conversation + pipeline layer, wired to the app's existing
integration points, so every lead touch is visible and driven from GHL.

**Architecture rule:** Supabase is the source of truth; GHL is the
conversation/pipeline layer. The app pushes every lead into GHL
(`lib/ghl/api.ts`); GHL drives SMS/email and pipeline; every meaningful
change webhooks back so Supabase stays authoritative. Money (wallets,
debits, disputes) never lives in GHL — that stays in Supabase + `/admin`.

## What the app already does (integration contract)

- **Outbound:** on form submit (`app/api/leads/submit/route.ts`),
  `ghlCreateContact` creates a GHL contact with custom fields
  `project_type`, `trade`, `zip_code`, `supabase_lead_id`, `sms_suppressed`
  and tags `new_lead`, `{trade-slug}`, and `sms_suppressed` when applicable.
- **Inbound:** two callback endpoints GHL must hit:
  - `POST /api/leads/qualify` — body `{supabase_lead_id, qualification_reply}`;
    fired when a lead is tagged `qualified`.
  - `POST /api/webhooks/ghl` — body `customData: {supabase_lead_id, status}`;
    fired on pipeline stage changes. Allowed statuses: `qualifying`,
    `qualified`, `nurture`, `routing`, `assigned`, `contacted`, `won`,
    `lost`, `unresponsive`. Anything else is silently ignored.
- **Env:** `GHL_API_KEY` + `GHL_LOCATION_ID` (both required to leave mock
  mode), `SMS_ACTIVE` gate.

---

## Phase 1 — Account & connection (Day 1)

1. **GHL Agency Unlimited** ($297/mo — start the 14-day trial). Create one
   location: "HiveQuote". Single location only; see the sub-accounts
   analysis — per-contractor locations are a later paid product, not launch
   infrastructure.
2. **LC Phone number** provisioned inside the location. Immediately start
   **A2P 10DLC brand + campaign registration** (needs LLC + EIN; 2–6 week
   gate). Everything else proceeds while it pends; `SMS_ACTIVE=false` until
   approved.
3. **Private Integration token** (Settings → Private Integrations),
   `contacts.write` scope minimum → `GHL_API_KEY`. Copy Location ID →
   `GHL_LOCATION_ID`. Paste into Vercel env vars, redeploy. Mock no-ops go
   live.

## Phase 2 — Data model inside GHL (Day 1–2)

**Custom fields — exact keys** (mismatched keys silently drop data):

| Field key | Type |
|---|---|
| `project_type` | text |
| `trade` | text |
| `zip_code` | text |
| `supabase_lead_id` | text |
| `sms_suppressed` | text |

**Tags:** `new_lead`, `sms_suppressed`, all 11 trade slugs (see
`data/trades.ts`), plus workflow tags `qualified`, `nurture`,
`unresponsive`.

**Known gap:** `utm_source/medium/campaign` are stored in Supabase but not
passed to GHL, so in-GHL attribution reporting is blind to traffic source.
Fix = add the three UTM fields to the `customFields` block in
`app/api/leads/submit/route.ts` and create matching GHL custom fields.

## Phase 3 — Pipeline (Day 2)

One pipeline, **"Lead Exchange"**, stages mapped 1:1 to the app's allowed
status strings:

New → Qualifying → Qualified → Routing → Assigned → Contacted →
Won / Lost / Nurture / Unresponsive

Stage display names are cosmetic; the `status` value each stage-change
workflow sends back must be one of the nine allowed strings or the Supabase
update is ignored.

## Phase 4 — The four GHL workflows (Day 2–4)

### W1 — Qualification (the money workflow)
- **Trigger:** contact created with tag `new_lead`.
- Move to *Qualifying* stage.
- **Gate check:** if `sms_suppressed = true` OR A2P not approved → email
  branch. Else SMS:
  > "Hi {{first_name}}, thanks for your {{trade}} request! Quick question —
  > are you looking to start within 30 days? Reply YES or NO."
- Reply YES → add tag `qualified`, move to *Qualified*.
- NO / no reply after 2 nudges over 48h → tag `nurture`, move to *Nurture*.

### W2 — Qualified callback
- **Trigger:** tag `qualified` added.
- Webhook (a): `POST https://hivequote.com/api/leads/qualify` with
  `{"supabase_lead_id": "{{contact.supabase_lead_id}}",
  "qualification_reply": "YES"}`.
- Webhook (b): n8n scenario-01 URL (`automation/n8n/01-...`) — runs
  contractor matching, wallet debit, contractor notification.

### W3 — Stage sync
- **Trigger:** pipeline stage changed.
- Webhook: `POST https://hivequote.com/api/webhooks/ghl` with
  `customData: {supabase_lead_id, status}` (canonical status string per
  stage). Keeps `/admin` and the daily audit truthful while the team works
  inside GHL.

### W4 — Job status intake
- **Trigger:** inbound SMS from a contractor containing WON/LOST/PENDING →
  forward to n8n scenario-03 webhook (verification tiers, PPC charge,
  review request).
- STOP: GHL suppresses natively; Twilio delivery webhook already points at
  `/api/webhooks/twilio/delivery` for global suppression.

## Phase 5 — Security fix before real traffic (Day 4)

`/api/leads/qualify` and `/api/webhooks/ghl` currently accept
**unauthenticated POSTs** — anyone who guesses the URL can flip lead
statuses. Before go-live: add a shared-secret check (e.g. require
`?key=<GHL_WEBHOOK_SECRET>`, append the secret to the W2/W3 webhook URLs,
add the env var). ~30 minutes of code; the only hard code blocker in this
playbook.

## Phase 6 — End-to-end test protocol (Day 5, before public traffic)

Run with your own phone, in order:

1. Submit the form on a trade page → GHL contact appears with all 5 custom
   fields + correct tags; Supabase lead row status `new`.
2. Reply YES (or manually add tag `qualified` if A2P pending) → Supabase
   flips to `qualified`, n8n routing fires, assignment created, test
   contractor wallet debited, contractor notification arrives.
3. Drag the contact through each pipeline stage → each status lands in
   Supabase (`/admin/leads`).
4. Resubmit same phone + trade within 72h → dedup: no new contact, no
   charge.
5. Reply STOP → suppression logged; next test lead with that phone shows
   `sms_suppressed: true` and takes W1's email branch.
6. Force a failure (break an n8n credential) → error handler texts/emails
   founder.
7. Next morning: 7 AM audit email reflects all of the above.

## Go-live gates

- ☐ Env vars live, mock mode off, W1–W4 active
- ☐ A2P status known; `SMS_ACTIVE` matches it (email-only launch is
  supported and fine)
- ☐ Webhook shared secret added to both callback endpoints
- ☐ Full test protocol passed end-to-end
- ☐ 3+ contractors with funded wallets in 2+ anchor trades
  (per `LAUNCH-PLAYBOOK.md`)

## What lives where (tracking reference)

| Data | Lives in | Visible in GHL? |
|---|---|---|
| Conversations (SMS/email) | GHL | ✅ natively |
| Pipeline stage / conversion | GHL (synced to Supabase via W3) | ✅ |
| Lead source attribution | Supabase (UTM) | ❌ until UTM fields added |
| Wallets, debits, payments | Supabase + Stripe | ❌ by design |
| Disputes, TCPA consents | Supabase + `/admin` | ❌ by design |
| Daily audit / error log | Supabase → 7 AM email | ❌ by design |
