import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { ghlCreateContact } from '@/lib/ghl/api'
import { getTrade } from '@/data/trades'
import {
  CONSENT_LANGUAGE_TEXT,
  CONSENT_LANGUAGE_VERSION,
  normalizePhone,
} from '@/lib/utils/tcpa'

const LeadSchema = z.object({
  trade_slug: z.string(),
  first_name: z.string().min(1),
  last_name: z.string().optional().default(''),
  phone: z.string().min(10),
  email: z.string().email(),
  city: z.string().optional().default(''),
  zip_code: z.string().length(5),
  project_type: z.string().min(1),
  property_type: z.enum(['residential', 'commercial', 'hoa', 'property_management']),
  timeline: z.string().min(1),
  sms_opt_in: z.boolean(),
  consent_confirmed: z.boolean(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = LeadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid form data', details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  if (!parsed.data.consent_confirmed) {
    return NextResponse.json({ error: 'Consent is required' }, { status: 400 })
  }

  const trade = getTrade(parsed.data.trade_slug)
  if (!trade) {
    return NextResponse.json({ error: 'Unknown trade' }, { status: 400 })
  }

  const phone = normalizePhone(parsed.data.phone)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const formUrl = req.headers.get('referer') ?? 'unknown'

  const supabase = createServiceClient()

  // ---- MOCK MODE: accept, log, succeed ----
  if (!supabase) {
    console.info('[mock] Lead received:', trade.slug, phone, parsed.data.zip_code)
    return NextResponse.json({ success: true, lead_id: `mock-${Date.now()}`, mock: true })
  }

  // ---- LIVE MODE ----
  // 1. Resolve trade UUID
  const { data: tradeRow } = await supabase
    .from('trades')
    .select('id')
    .eq('slug', trade.slug)
    .single()
  if (!tradeRow) {
    return NextResponse.json({ error: 'Trade not found in database' }, { status: 500 })
  }

  // 2. Check SMS suppression list (lead is still created; SMS just won't send)
  const { data: suppressed } = await supabase
    .from('sms_suppression')
    .select('id')
    .eq('phone', phone)
    .maybeSingle()
  const isSuppressed = Boolean(suppressed)

  // 3. Insert lead (DB dedup index catches same phone+trade same day)
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .insert({
      trade_id: tradeRow.id,
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      phone,
      email: parsed.data.email,
      city: parsed.data.city,
      zip_code: parsed.data.zip_code,
      project_type: parsed.data.project_type,
      property_type: parsed.data.property_type,
      timeline: parsed.data.timeline,
      sms_opt_in: parsed.data.sms_opt_in && !isSuppressed,
      source: 'form_web',
      ip_address: ip,
      utm_source: parsed.data.utm_source,
      utm_medium: parsed.data.utm_medium,
      utm_campaign: parsed.data.utm_campaign,
    })
    .select()
    .single()

  if (leadError) {
    if (leadError.code === '23505') {
      // Duplicate: suppress silently, never charge a contractor
      return NextResponse.json({ success: true, lead_id: null, deduplicated: true })
    }
    console.error('Lead insert failed:', leadError.message)
    return NextResponse.json({ error: 'Could not save your request' }, { status: 500 })
  }

  // 4. TCPA consent record (exact language, IP, URL, version)
  await supabase.from('consents').insert({
    lead_id: lead.id,
    phone,
    ip_address: ip,
    form_url: formUrl,
    consent_language_version: CONSENT_LANGUAGE_VERSION,
    consent_language_text: CONSENT_LANGUAGE_TEXT,
    opt_in_confirmed: parsed.data.consent_confirmed,
  })

  // 5. Create GHL contact → triggers qualification workflow
  await ghlCreateContact({
    firstName: parsed.data.first_name,
    lastName: parsed.data.last_name,
    phone,
    email: parsed.data.email,
    customFields: {
      project_type: parsed.data.project_type,
      trade: trade.slug,
      zip_code: parsed.data.zip_code,
      supabase_lead_id: lead.id,
      sms_suppressed: String(isSuppressed),
    },
    tags: ['new_lead', trade.slug, ...(isSuppressed ? ['sms_suppressed'] : [])],
  })

  return NextResponse.json({ success: true, lead_id: lead.id })
}
