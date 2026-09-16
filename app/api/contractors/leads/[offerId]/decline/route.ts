import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireContractor } from '@/lib/auth/contractor'
import { authorizedMutationOrigin } from '@/lib/security/request'
import { createServiceClient } from '@/lib/supabase/server'

const DeclineSchema = z.object({
  reason: z.string().max(500).optional(),
})

type RouteContext = { params: { offerId: string } }

/** Releases this contractor's offer. Only internal routing may choose the replacement contractor. */
export async function POST(req: NextRequest, { params }: RouteContext) {
  if (!authorizedMutationOrigin(req)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }

  const contractor = await requireContractor(req)
  if (!contractor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const offerId = z.string().uuid().safeParse(params.offerId)
  const body = DeclineSchema.safeParse(await req.json().catch(() => ({})))
  if (!offerId.success || !body.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const supabase = createServiceClient()
  if (!supabase) return NextResponse.json({ error: 'Lead service unavailable' }, { status: 503 })

  const { data, error } = await supabase.rpc('decline_lead_offer', {
    p_offer_id: offerId.data,
    p_contractor_id: contractor.contractorId,
    p_reason: body.data.reason ?? null,
    p_actor: `contractor:${contractor.userId}`,
  })

  if (error) {
    console.error('decline_lead_offer failed', { code: error.code, message: error.message })
    const missing = /not found for contractor/i.test(error.message)
    return NextResponse.json({ error: missing ? 'Offer not found' : 'Offer transition failed' }, { status: missing ? 404 : 409 })
  }

  const result = Array.isArray(data) ? data[0] : data
  if (!result) return NextResponse.json({ error: 'Offer transition returned no state' }, { status: 500 })

  return NextResponse.json({
    success: result.transition_status === 'declined',
    ...result,
    reroute_required: result.transition_status === 'declined',
  })
}
