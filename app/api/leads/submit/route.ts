import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getTrade } from '@/data/trades'

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
  const body = await req.json().catch(() => null)
  const parsed = LeadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid form data', details: parsed.error.flatten() }, { status: 400 })
  }
  if (!parsed.data.consent_confirmed) {
    return NextResponse.json({ error: 'Consent is required' }, { status: 400 })
  }
  if (!getTrade(parsed.data.trade_slug)) {
    return NextResponse.json({ error: 'Unknown trade' }, { status: 400 })
  }

  return NextResponse.json(
    {
      error: 'Lead intake is temporarily unavailable while HiveQuote activates the Hedy-native intake path.',
      code: 'HEDY_INTAKE_NOT_ACTIVATED',
      accepted: false,
    },
    { status: 503 }
  )
}
