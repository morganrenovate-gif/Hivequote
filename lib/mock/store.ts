/**
 * In-memory mock data store. Powers the entire app (portal, admin,
 * APIs) when Supabase is not configured, seeded with realistic demo
 * data so every screen is reviewable on day one.
 */

export interface MockLead {
  id: string
  trade_slug: string
  first_name: string
  last_name: string
  phone: string
  email: string
  city: string
  zip_code: string
  project_type: string
  property_type: string
  timeline: string
  status: string
  sms_opt_in: boolean
  source: string
  created_at: string
}

export interface MockContractor {
  id: string
  business_name: string
  owner_name: string
  trade_slug: string
  phone: string
  email: string
  license_number: string
  license_status: string
  status: string
  billing_model: string
  wallet_balance_cents: number
  leads_delivered_this_month: number
  total_leads_delivered: number
  total_jobs_won: number
  close_rate_pct: number
  rating: number
  review_count: number
  city: string
  zips: string[]
  slug: string
  blurb: string
  created_at: string
}

export interface MockPayment {
  id: string
  contractor_name: string
  amount_cents: number
  payment_type: string
  payment_method: string
  status: string
  created_at: string
}

export interface MockDispute {
  id: string
  contractor_name: string
  lead_name: string
  dispute_type: string
  score: number | null
  status: string
  created_at: string
}

export interface MockConsent {
  id: string
  phone: string
  form_url: string
  version: string
  opt_in: boolean
  created_at: string
}

const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86400000).toISOString()

export const mockContractors: MockContractor[] = [
  {
    id: 'c1', slug: 'wasatch-voltage', business_name: 'Wasatch Voltage Electric',
    owner_name: 'Dan Hollis', trade_slug: 'electrician', phone: '(801) 555-0141',
    email: 'dan@wasatchvoltage.com', license_number: 'UT-11542876-5501',
    license_status: 'active', status: 'active', billing_model: 'retainer_growth',
    wallet_balance_cents: 42000, leads_delivered_this_month: 7,
    total_leads_delivered: 63, total_jobs_won: 29, close_rate_pct: 46.0,
    rating: 4.9, review_count: 212, city: 'Sandy',
    zips: ['84070', '84092', '84093', '84094'],
    blurb: 'Master electricians serving the southeast valley for 14 years. Panels, EV chargers, remodels.',
    created_at: daysAgo(180),
  },
  {
    id: 'c2', slug: 'beehive-plumbing-co', business_name: 'Beehive Plumbing Co.',
    owner_name: 'Marcus Reyes', trade_slug: 'plumber', phone: '(801) 555-0176',
    email: 'marcus@beehiveplumb.co', license_number: 'UT-10938455-5501',
    license_status: 'active', status: 'active', billing_model: 'ppl',
    wallet_balance_cents: 28500, leads_delivered_this_month: 5,
    total_leads_delivered: 41, total_jobs_won: 17, close_rate_pct: 41.5,
    rating: 4.8, review_count: 156, city: 'West Jordan',
    zips: ['84084', '84088', '84081'],
    blurb: 'Family-owned plumbing. Water heaters, remodels, and repipes across the west valley.',
    created_at: daysAgo(150),
  },
  {
    id: 'c3', slug: 'summit-epoxy', business_name: 'Summit Epoxy Floors',
    owner_name: 'Kyle Bennion', trade_slug: 'epoxy-residential', phone: '(801) 555-0192',
    email: 'kyle@summitepoxy.com', license_number: 'UT-11876220-5501',
    license_status: 'active', status: 'active', billing_model: 'retainer_starter',
    wallet_balance_cents: 15000, leads_delivered_this_month: 4,
    total_leads_delivered: 38, total_jobs_won: 21, close_rate_pct: 55.3,
    rating: 5.0, review_count: 98, city: 'Lehi',
    zips: ['84043', '84003', '84042', '84062'],
    blurb: 'Polyaspartic garage floors with diamond-ground prep. 15-year warranty.',
    created_at: daysAgo(120),
  },
  {
    id: 'c4', slug: 'timberline-flooring', business_name: 'Timberline Flooring',
    owner_name: 'Angela Park', trade_slug: 'flooring', phone: '(385) 555-0113',
    email: 'angela@timberlinefloors.com', license_number: 'UT-11209981-5501',
    license_status: 'active', status: 'active', billing_model: 'ppl',
    wallet_balance_cents: 61000, leads_delivered_this_month: 6,
    total_leads_delivered: 52, total_jobs_won: 24, close_rate_pct: 46.2,
    rating: 4.9, review_count: 187, city: 'Draper',
    zips: ['84020', '84092', '84065'],
    blurb: 'LVP, hardwood, and tile installed by in-house crews — never subbed out.',
    created_at: daysAgo(140),
  },
  {
    id: 'c5', slug: 'granite-peak-cabinets', business_name: 'Granite Peak Cabinets',
    owner_name: 'Steve Larsen', trade_slug: 'cabinet-install', phone: '(801) 555-0155',
    email: 'steve@granitepeakcabinets.com', license_number: 'UT-10884312-5501',
    license_status: 'active', status: 'active', billing_model: 'retainer_growth',
    wallet_balance_cents: 90000, leads_delivered_this_month: 3,
    total_leads_delivered: 22, total_jobs_won: 11, close_rate_pct: 50.0,
    rating: 4.8, review_count: 74, city: 'Orem',
    zips: ['84057', '84058', '84097', '84604'],
    blurb: 'Custom cabinet design, supply, and install. Kitchens, baths, and built-ins.',
    created_at: daysAgo(95),
  },
  {
    id: 'c6', slug: 'canyon-court-works', business_name: 'Canyon Court Works',
    owner_name: 'Tyler Moss', trade_slug: 'pickleball-resurfacing', phone: '(801) 555-0129',
    email: 'tyler@canyoncourtworks.com', license_number: 'UT-11633090-5501',
    license_status: 'active', status: 'active', billing_model: 'ppc',
    wallet_balance_cents: 12000, leads_delivered_this_month: 2,
    total_leads_delivered: 19, total_jobs_won: 12, close_rate_pct: 63.2,
    rating: 5.0, review_count: 41, city: 'Salt Lake City',
    zips: ['84101', '84102', '84103', '84105', '84106'],
    blurb: 'Utah’s pickleball resurfacing specialists. Acrylic systems, crack repair, HOA courts.',
    created_at: daysAgo(200),
  },
]

export const mockLeads: MockLead[] = [
  {
    id: 'l1', trade_slug: 'electrician', first_name: 'Rachel', last_name: 'Kimball',
    phone: '(801) 555-2201', email: 'rachel.k@example.com', city: 'Sandy',
    zip_code: '84092', project_type: 'EV charger installation',
    property_type: 'residential', timeline: 'ASAP', status: 'assigned',
    sms_opt_in: true, source: 'form_web', created_at: daysAgo(0),
  },
  {
    id: 'l2', trade_slug: 'plumber', first_name: 'Jordan', last_name: 'Tanner',
    phone: '(385) 555-2214', email: 'jtanner@example.com', city: 'West Jordan',
    zip_code: '84084', project_type: 'Water heater replacement',
    property_type: 'residential', timeline: 'ASAP', status: 'won',
    sms_opt_in: true, source: 'form_web', created_at: daysAgo(2),
  },
  {
    id: 'l3', trade_slug: 'epoxy-residential', first_name: 'Melissa', last_name: 'Ostler',
    phone: '(801) 555-2299', email: 'mostler@example.com', city: 'Lehi',
    zip_code: '84043', project_type: 'Garage floor (3+ car)',
    property_type: 'residential', timeline: 'Within 30 days', status: 'qualified',
    sms_opt_in: true, source: 'facebook_group', created_at: daysAgo(1),
  },
  {
    id: 'l4', trade_slug: 'flooring', first_name: 'Ben', last_name: 'Whitaker',
    phone: '(801) 555-2307', email: 'benw@example.com', city: 'Draper',
    zip_code: '84020', project_type: 'Luxury vinyl plank (LVP)',
    property_type: 'residential', timeline: 'Within 30 days', status: 'contacted',
    sms_opt_in: true, source: 'form_web', created_at: daysAgo(3),
  },
  {
    id: 'l5', trade_slug: 'cabinet-install', first_name: 'Sarah', last_name: 'Nguyen',
    phone: '(385) 555-2340', email: 'snguyen@example.com', city: 'Orem',
    zip_code: '84057', project_type: 'Full kitchen cabinets',
    property_type: 'residential', timeline: 'Planning stage', status: 'nurture',
    sms_opt_in: true, source: 'nextdoor', created_at: daysAgo(4),
  },
  {
    id: 'l6', trade_slug: 'pickleball-resurfacing', first_name: 'Greg', last_name: 'Holladay',
    phone: '(801) 555-2415', email: 'gregh@example.com', city: 'Salt Lake City',
    zip_code: '84106', project_type: 'HOA / community courts',
    property_type: 'hoa', timeline: 'Within 30 days', status: 'won',
    sms_opt_in: true, source: 'ksl', created_at: daysAgo(6),
  },
  {
    id: 'l7', trade_slug: 'electrician', first_name: 'Dana', last_name: 'Fielding',
    phone: '(801) 555-2470', email: 'danaf@example.com', city: 'Murray',
    zip_code: '84107', project_type: 'Panel upgrade / replacement',
    property_type: 'residential', timeline: 'ASAP', status: 'routing',
    sms_opt_in: true, source: 'form_web', created_at: daysAgo(0),
  },
  {
    id: 'l8', trade_slug: 'concrete-coating', first_name: 'Luis', last_name: 'Marquez',
    phone: '(385) 555-2521', email: 'lmarquez@example.com', city: 'Herriman',
    zip_code: '84096', project_type: 'Driveway coating / sealing',
    property_type: 'residential', timeline: 'Planning stage', status: 'new',
    sms_opt_in: false, source: 'form_web', created_at: daysAgo(0),
  },
]

export const mockPayments: MockPayment[] = [
  { id: 'p1', contractor_name: 'Wasatch Voltage Electric', amount_cents: 59900, payment_type: 'retainer', payment_method: 'ach', status: 'succeeded', created_at: daysAgo(2) },
  { id: 'p2', contractor_name: 'Beehive Plumbing Co.', amount_cents: 50000, payment_type: 'wallet_topup', payment_method: 'ach', status: 'succeeded', created_at: daysAgo(3) },
  { id: 'p3', contractor_name: 'Summit Epoxy Floors', amount_cents: 29900, payment_type: 'retainer', payment_method: 'ach', status: 'succeeded', created_at: daysAgo(5) },
  { id: 'p4', contractor_name: 'Canyon Court Works', amount_cents: 30000, payment_type: 'ppc_fee', payment_method: 'ach', status: 'succeeded', created_at: daysAgo(6) },
  { id: 'p5', contractor_name: 'Timberline Flooring', amount_cents: 10000, payment_type: 'ppl_charge', payment_method: 'ach', status: 'succeeded', created_at: daysAgo(1) },
  { id: 'p6', contractor_name: 'Granite Peak Cabinets', amount_cents: 9700, payment_type: 'onboarding_fee', payment_method: 'card', status: 'succeeded', created_at: daysAgo(9) },
  { id: 'p7', contractor_name: 'Beehive Plumbing Co.', amount_cents: 5000, payment_type: 'ppl_charge', payment_method: 'ach', status: 'pending', created_at: daysAgo(0) },
]

export const mockDisputes: MockDispute[] = [
  { id: 'd1', contractor_name: 'Timberline Flooring', lead_name: 'K. Sorensen', dispute_type: 'unreachable_homeowner', score: null, status: 'open', created_at: daysAgo(1) },
  { id: 'd2', contractor_name: 'Beehive Plumbing Co.', lead_name: 'A. Draper', dispute_type: 'low_satisfaction', score: 2, status: 'resolved', created_at: daysAgo(12) },
]

export const mockConsents: MockConsent[] = mockLeads
  .filter((l) => l.sms_opt_in)
  .map((l, i) => ({
    id: `cons-${i + 1}`,
    phone: l.phone,
    form_url: `https://hivequote.com/${l.trade_slug}`,
    version: 'v2',
    opt_in: true,
    created_at: l.created_at,
  }))

export const mockMonitoring = {
  automationHealth: [
    { scenario: 'Lead Qualification → Routing', status: 'healthy', lastRun: daysAgo(0), errors24h: 0 },
    { scenario: 'Contractor ACCEPT Handler', status: 'healthy', lastRun: daysAgo(0), errors24h: 0 },
    { scenario: 'Stripe Payment Webhook', status: 'healthy', lastRun: daysAgo(0), errors24h: 0 },
    { scenario: 'Twilio Delivery Receipts', status: 'degraded', lastRun: daysAgo(0), errors24h: 1 },
    { scenario: 'Daily Lead Audit Report', status: 'healthy', lastRun: daysAgo(0), errors24h: 0 },
    { scenario: 'License Verification (Monthly)', status: 'healthy', lastRun: daysAgo(14), errors24h: 0 },
  ],
  a2pStatus: 'pending',
  smsActive: false,
  stripeDisputeRate: 0.002,
}
