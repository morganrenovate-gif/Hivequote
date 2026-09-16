import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authorizedInternalRequest } from '@/lib/auth/internal'
import { createServiceClient } from '@/lib/supabase/server'

const RouteNextSchema = z.object({
  lead_id: z.string().uuid(),
  offer_ttl_minutes: z.number().int().min(5).max(1440).default(60),
  idempotency_key: z.string().min(6).max(128).optional(),
})

/**
 * Internal routing authority. Automation may ask HiveQuote to reserve the next eligible contractor,
 * but it may not choose the contractor or write assignment/billing state itself.
 */
export async function POST(req: NextRequest) {
  if (!authorizedInternalRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = RouteNextSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Routing service unavailable' }, { status: 503 })
  }

  const { data, error } = await supabase.rpc('reserve_next_lead_offer', {
    p_lead_id: parsed.data.lead_id,
    p_offer_ttl_minutes: parsed.data.offer_ttl_minutes,
    p_actor: 'internal_api',
    p_idempotency_key: parsed.data.idempotency_key ?? null,
  })

  if (error) {
    console.error('reserve_next_lead_offer failed', {
      leadId: parsed.data.lead_id,
      code: error.code,
      message: error.message,
    })
    return NextResponse.json({ error: 'Routing transition failed' }, { status: 409 })
  }

  const result = Array.isArray(data) ? data[0] : data
  if (!result) {
    return NextResponse.json({ error: 'Routing returned no state' }, { status: 500 })
  }

  return NextResponse.json({ success: true, ...result })
}
