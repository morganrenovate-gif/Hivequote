-- ============================================================
-- HiveQuote — Utah Home Services Lead Exchange
-- Complete Supabase schema (V2.0 architecture, HiveQuote brand)
-- Execute in the Supabase SQL editor.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TRADES
-- ============================================================
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  sub_brand TEXT,
  ppl_price_cents INTEGER NOT NULL DEFAULT 10000,
  ppc_fee_cents INTEGER NOT NULL DEFAULT 30000,
  avg_job_value_cents INTEGER,
  is_anchor BOOLEAN NOT NULL DEFAULT FALSE,       -- year-round anchor trade
  is_seasonal BOOLEAN NOT NULL DEFAULT FALSE,     -- weather-dependent seasonal trade
  seasonal_multiplier_nov NUMERIC(3,2) DEFAULT 0.70,
  seasonal_multiplier_dec NUMERIC(3,2) DEFAULT 0.40,
  seasonal_multiplier_jan NUMERIC(3,2) DEFAULT 0.40,
  seasonal_multiplier_feb NUMERIC(3,2) DEFAULT 0.50,
  seasonal_multiplier_mar NUMERIC(3,2) DEFAULT 0.70,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CONTRACTORS
-- ============================================================
CREATE TABLE contractors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ghl_contact_id TEXT UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  stripe_ach_mandate_id TEXT,                     -- for PPC auto-pull
  business_name TEXT NOT NULL,
  owner_first_name TEXT,
  owner_last_name TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  license_number TEXT,
  license_verified_at TIMESTAMPTZ,                -- last DOPL verification
  license_status TEXT DEFAULT 'unverified',       -- active | suspended | expired | unverified
  insurance_cert_url TEXT,
  insurance_verified_at TIMESTAMPTZ,
  agreement_signed_at TIMESTAMPTZ,
  agreement_url TEXT,
  founding_partner_consideration_paid BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending',
    -- pending | capacity_waitlist | active | paused | suspended | churned
  billing_model TEXT NOT NULL DEFAULT 'ppl',
    -- ppl | ppc | retainer_starter | retainer_growth | retainer_dominance | retainer_exclusive
  ppc_eligible BOOLEAN NOT NULL DEFAULT FALSE,    -- only true after 60 days + founder approval
  ppc_eligible_since TIMESTAMPTZ,
  wallet_balance_cents INTEGER NOT NULL DEFAULT 0,
  wallet_threshold_cents INTEGER NOT NULL DEFAULT 20000,
  stripe_subscription_id TEXT,
  retainer_monthly_cents INTEGER,
  retainer_guaranteed_leads INTEGER,
  leads_delivered_this_month INTEGER NOT NULL DEFAULT 0,
  leads_rollover_credits INTEGER NOT NULL DEFAULT 0,
  total_leads_delivered INTEGER NOT NULL DEFAULT 0,
  total_jobs_won INTEGER NOT NULL DEFAULT 0,
  total_fees_paid_cents INTEGER NOT NULL DEFAULT 0,
  close_rate_pct NUMERIC(5,2),
  consecutive_non_response_count INTEGER NOT NULL DEFAULT 0,
  nps_score INTEGER,
  google_review_link TEXT,
  capacity_status TEXT DEFAULT 'available',       -- available | limited | full | waitlist
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CONTRACTOR_SERVICE_AREAS
-- ============================================================
CREATE TABLE contractor_service_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  trade_id UUID NOT NULL REFERENCES trades(id),
  zip_code TEXT NOT NULL,
  is_exclusive_zone BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(contractor_id, trade_id, zip_code)
);

-- ============================================================
-- HOMEOWNER LEADS
-- ============================================================
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ghl_contact_id TEXT UNIQUE,
  trade_id UUID NOT NULL REFERENCES trades(id),
  first_name TEXT NOT NULL,
  last_name TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  city TEXT,
  zip_code TEXT NOT NULL,
  address TEXT,
  project_type TEXT,
  property_type TEXT,
  project_size TEXT,
  estimated_budget_range TEXT,
  timeline TEXT NOT NULL,
  how_heard TEXT,
  sms_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
  tcpa_consent_id UUID,
  status TEXT NOT NULL DEFAULT 'new',
    -- new | qualifying | qualified | nurture | routing | assigned | contacted |
    -- won | lost | disputed | review_requested | review_received | unresponsive | deduplicated
  qualification_reply TEXT,
  qualification_attempted_at TIMESTAMPTZ,
  qualified_at TIMESTAMPTZ,
  source TEXT,
  source_detail TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  ip_address TEXT,
  is_duplicate BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deduplication: same phone + trade within same day is suppressed
CREATE UNIQUE INDEX idx_leads_dedup
  ON leads(phone, trade_id, (date_trunc('day', created_at)::date))
  WHERE is_duplicate = FALSE;

-- ============================================================
-- TCPA CONSENTS
-- ============================================================
CREATE TABLE consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id),
  phone TEXT NOT NULL,
  consent_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT NOT NULL,
  form_url TEXT NOT NULL,
  consent_language_version TEXT NOT NULL DEFAULT 'v1',
  consent_language_text TEXT NOT NULL,
  opt_in_confirmed BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SMS SUPPRESSION (global opt-out list)
-- ============================================================
CREATE TABLE sms_suppression (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT NOT NULL UNIQUE,
  suppressed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT,                                    -- stop_reply | dnc_check | manual
  notes TEXT
);

-- ============================================================
-- LEAD ASSIGNMENTS
-- ============================================================
CREATE TABLE lead_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id),
  contractor_id UUID NOT NULL REFERENCES contractors(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  notification_sent_at TIMESTAMPTZ,
  notification_channel TEXT,                      -- sms | email | both
  sms_delivery_confirmed BOOLEAN,
  contractor_accepted_at TIMESTAMPTZ,
  contractor_contacted_homeowner_at TIMESTAMPTZ,
  outcome TEXT,
    -- won | lost | pending | disputed | expired | won_verified | won_unverified
  outcome_reported_at TIMESTAMPTZ,
  verification_tier INTEGER,                      -- 1 | 2 | 3 based on job size
  verification_type TEXT,
  verification_data TEXT,
  homeowner_confirmed_close BOOLEAN,
  homeowner_confirmation_sent_at TIMESTAMPTZ,
  homeowner_confirmed_at TIMESTAMPTZ,
  ppl_charged BOOLEAN NOT NULL DEFAULT FALSE,
  ppl_amount_cents INTEGER,
  ppc_fee_due BOOLEAN NOT NULL DEFAULT FALSE,
  ppc_fee_paid BOOLEAN NOT NULL DEFAULT FALSE,
  ppc_ach_pull_triggered_at TIMESTAMPTZ,
  ppc_ach_pull_succeeded_at TIMESTAMPTZ,
  dispute_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- JOB VERIFICATIONS
-- ============================================================
CREATE TABLE job_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_assignment_id UUID NOT NULL REFERENCES lead_assignments(id),
  verification_tier INTEGER NOT NULL,             -- 1 | 2 | 3
  verification_method TEXT NOT NULL,
    -- homeowner_sms_confirm | photo_upload | permit_number | signed_estimate | homeowner_phone
  verification_data TEXT,
  verified_at TIMESTAMPTZ,
  verified_by TEXT DEFAULT 'system',              -- system | founder
  passed BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id UUID NOT NULL REFERENCES contractors(id),
  lead_assignment_id UUID REFERENCES lead_assignments(id),
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  payment_type TEXT NOT NULL,
    -- ppl_charge | ppc_fee | retainer | onboarding_fee | wallet_topup | co_marketing | saas
  payment_method TEXT,                            -- ach | card
  status TEXT NOT NULL DEFAULT 'pending',
    -- pending | succeeded | failed | refunded | disputed
  dispute_rate_snapshot NUMERIC(5,4),
  paid_at TIMESTAMPTZ,
  invoice_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DISPUTES
-- ============================================================
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_assignment_id UUID NOT NULL REFERENCES lead_assignments(id),
  reported_by TEXT NOT NULL,
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  dispute_type TEXT NOT NULL,
  homeowner_satisfaction_score INTEGER,
  contractor_notes TEXT,
  homeowner_notes TEXT,
  ghl_delivery_log TEXT,
  supabase_record_url TEXT,
  make_execution_log TEXT,
  resolution TEXT,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  credit_amount_cents INTEGER,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LEAD_DELIVERY_EVENTS (full audit log)
-- ============================================================
CREATE TABLE lead_delivery_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_assignment_id UUID NOT NULL REFERENCES lead_assignments(id),
  event_type TEXT NOT NULL,
  event_data JSONB,
  triggered_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CONTRACTOR_EVENTS (continuity audit log)
-- ============================================================
CREATE TABLE contractor_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id UUID NOT NULL REFERENCES contractors(id),
  event_type TEXT NOT NULL,
    -- license_verified | license_suspended | license_revoked | non_response_flag |
    -- status_paused | status_reactivated | leads_rerouted | wallet_refunded | ppc_approved | ppc_revoked
  event_data JSONB,
  triggered_by TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CONTRACTOR_REFERRALS
-- ============================================================
CREATE TABLE contractor_referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referring_contractor_id UUID NOT NULL REFERENCES contractors(id),
  referred_contractor_id UUID REFERENCES contractors(id),
  referral_code TEXT UNIQUE NOT NULL,
  referral_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  credit_amount_cents INTEGER,
  credited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ERROR LOG (n8n/Make.com scenario failures)
-- ============================================================
CREATE TABLE error_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scenario_name TEXT NOT NULL,
  error_message TEXT,
  input_payload JSONB,
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ
);

-- ============================================================
-- CONFIG / SYSTEM SETTINGS
-- ============================================================
CREATE TABLE config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO config (key, value, description) VALUES
  ('stripe_ppl_product_id', '', 'Stripe Product ID for PPL lead charges'),
  ('stripe_ppc_product_id', '', 'Stripe Product ID for PPC service fees'),
  ('stripe_onboarding_product_id', '', 'Stripe Product ID for contractor onboarding'),
  ('ghl_api_key', '', 'GoHighLevel API key'),
  ('ghl_location_id', '', 'GoHighLevel location ID'),
  ('wallet_low_threshold_cents', '20000', 'Trigger wallet refill SMS below this amount'),
  ('lead_hold_hours', '4', 'Hours to hold a lead pending wallet top-up'),
  ('lead_exclusive_window_minutes', '60', 'Minutes lead is exclusive to assigned contractor'),
  ('ppc_payment_deadline_hours', '24', 'Hours for ACH pull attempt on PPC close confirmation'),
  ('review_request_delay_minutes', '45', 'Minutes after job complete before review request SMS'),
  ('a2p_registration_status', 'pending', 'A2P 10DLC registration status: pending | approved | rejected'),
  ('sms_active', 'false', 'Set to true only after A2P registration is approved'),
  ('ppc_min_trust_days', '60', 'Minimum days on platform before PPC eligibility'),
  ('ppc_min_leads_received', '5', 'Minimum leads received before PPC eligibility'),
  ('backup_contractor_min_per_territory', '2', 'Minimum contractors per trade/county for continuity');

-- ============================================================
-- SEED TRADES (HiveQuote brand system)
-- ============================================================
INSERT INTO trades (slug, name, sub_brand, ppl_price_cents, ppc_fee_cents, avg_job_value_cents, is_anchor, is_seasonal) VALUES
  ('electrician', 'Electrician', 'HiveQuote Electrical', 6000, 15000, 200000, TRUE, FALSE),
  ('plumber', 'Plumber', 'HiveQuote Plumbing', 5000, 12500, 150000, TRUE, FALSE),
  ('flooring', 'Flooring', 'HiveQuote Flooring', 10000, 30000, 600000, TRUE, FALSE),
  ('cabinet-install', 'Cabinet Supply & Install', 'HiveQuote Cabinets', 22500, 50000, 1500000, TRUE, FALSE),
  ('epoxy-residential', 'Epoxy Floor Coating (Residential)', 'HiveQuote Epoxy', 7500, 20000, 250000, FALSE, TRUE),
  ('epoxy-commercial', 'Epoxy Floor Coating (Commercial)', 'HiveQuote Epoxy', 22500, 50000, 1000000, FALSE, FALSE),
  ('concrete-coating', 'Concrete Coating', 'HiveQuote Concrete', 7500, 20000, 300000, FALSE, TRUE),
  ('excavation', 'Excavation', 'HiveQuote Excavation', 17500, 40000, 800000, FALSE, TRUE),
  ('framing', 'Framing', 'HiveQuote Framing', 30000, 80000, 2500000, FALSE, FALSE),
  ('sports-courts', 'Sports Courts (New Construction)', 'HiveQuote Courts', 37500, 100000, 3500000, FALSE, FALSE),
  ('pickleball-resurfacing', 'Pickleball Court Resurfacing', 'HiveQuote Courts', 10000, 30000, 500000, FALSE, TRUE);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_leads_trade_id ON leads(trade_id);
CREATE INDEX idx_leads_zip_code ON leads(zip_code);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_lead_assignments_lead_id ON lead_assignments(lead_id);
CREATE INDEX idx_lead_assignments_contractor_id ON lead_assignments(contractor_id);
CREATE INDEX idx_lead_assignments_outcome ON lead_assignments(outcome);
CREATE INDEX idx_contractor_service_areas_trade_zip ON contractor_service_areas(trade_id, zip_code);
CREATE INDEX idx_payments_contractor_id ON payments(contractor_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_consents_phone ON consents(phone);
CREATE INDEX idx_sms_suppression_phone ON sms_suppression(phone);
CREATE INDEX idx_error_log_occurred ON error_log(occurred_at);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contractors_own_data" ON lead_assignments
  FOR SELECT USING (
    contractor_id = (SELECT id FROM contractors WHERE id = auth.uid())
  );

CREATE POLICY "contractors_own_payments" ON payments
  FOR SELECT USING (
    contractor_id = (SELECT id FROM contractors WHERE id = auth.uid())
  );

-- ============================================================
-- VIEWS
-- ============================================================
CREATE VIEW contractor_performance AS
SELECT
  c.id,
  c.business_name,
  c.billing_model,
  c.status,
  c.ppc_eligible,
  c.consecutive_non_response_count,
  c.license_status,
  COUNT(la.id) AS total_leads,
  COUNT(CASE WHEN la.outcome IN ('won', 'won_verified') THEN 1 END) AS jobs_won,
  COUNT(CASE WHEN la.outcome = 'lost' THEN 1 END) AS jobs_lost,
  ROUND(
    100.0 * COUNT(CASE WHEN la.outcome IN ('won', 'won_verified') THEN 1 END) / NULLIF(COUNT(la.id), 0), 2
  ) AS close_rate_pct,
  COALESCE(SUM(CASE WHEN p.status = 'succeeded' THEN p.amount_cents END), 0) AS total_paid_cents,
  c.wallet_balance_cents
FROM contractors c
LEFT JOIN lead_assignments la ON la.contractor_id = c.id
LEFT JOIN payments p ON p.contractor_id = c.id
GROUP BY c.id, c.business_name, c.billing_model, c.status, c.ppc_eligible,
         c.consecutive_non_response_count, c.license_status, c.wallet_balance_cents;

CREATE VIEW monthly_revenue AS
SELECT
  DATE_TRUNC('month', paid_at) AS month,
  payment_type,
  COUNT(*) AS transaction_count,
  SUM(amount_cents) AS total_cents
FROM payments
WHERE status = 'succeeded'
GROUP BY 1, 2
ORDER BY 1 DESC, 2;

CREATE VIEW lead_funnel AS
SELECT
  t.name AS trade,
  t.is_anchor,
  t.is_seasonal,
  COUNT(*) AS total_leads,
  COUNT(CASE WHEN l.status IN ('qualified','routing','assigned','contacted','won','won_verified','lost') THEN 1 END) AS qualified,
  COUNT(CASE WHEN l.status IN ('assigned','contacted','won','won_verified','lost') THEN 1 END) AS assigned,
  COUNT(CASE WHEN l.status IN ('won', 'won_verified') THEN 1 END) AS won,
  ROUND(100.0 * COUNT(CASE WHEN l.status IN ('won','won_verified') THEN 1 END) / NULLIF(COUNT(*), 0), 2) AS overall_win_rate_pct
FROM leads l
JOIN trades t ON t.id = l.trade_id
GROUP BY t.name, t.is_anchor, t.is_seasonal
ORDER BY total_leads DESC;

CREATE VIEW seasonal_revenue_projection AS
SELECT
  DATE_TRUNC('month', NOW()) AS projected_month,
  t.name AS trade,
  CASE
    WHEN EXTRACT(MONTH FROM NOW()) IN (12, 1) THEN t.seasonal_multiplier_dec
    WHEN EXTRACT(MONTH FROM NOW()) = 2 THEN t.seasonal_multiplier_feb
    WHEN EXTRACT(MONTH FROM NOW()) = 3 THEN t.seasonal_multiplier_mar
    WHEN EXTRACT(MONTH FROM NOW()) = 11 THEN t.seasonal_multiplier_nov
    ELSE 1.0
  END AS current_multiplier
FROM trades t
WHERE t.is_active = TRUE;
