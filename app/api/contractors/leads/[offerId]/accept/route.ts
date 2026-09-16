import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireContractor } from '@/lib/auth/contractor'
import { authorizedMutationOrigin } from '@/lib/security/request'
import { createServiceClient } from '@/lib/supabase/server'

const AcceptSchema = z.object({
  contact_sla_minutes: z.number().int().min(15).max(1440).default(120),
})

type RouteContext = { params: { offerId: string } }

/** Contractor accepts only an offer that belongs to their authenticated business. */
export async function POST(req: NextRequest, { params }: RouteContext) {
  if (!authorizedMutationOrigin(req)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }

  const contractor = await requireContractor(req)
  if (!contractor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const offerId = z.string().uuid().safeParse(params.offerId)
  const body = AcceptSchema.safeParse(await req.json().catch(() => ({})))
  if (!offerId.success || !body.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Lead service unavailable' }, { status: 503 })
  }

  const { data, error } = await supabase.rpc('accept_lead_offer', {
    p_offer_id: offerId.data,
    p_contractor_id: contractor.contractorId,
    p_contact_sla_minutes: body.data.contact_sla_minutes,
    p_actor: `contractor:${contractor.userId}`,
  })

  if (error) {
    console.error('accept_lead_offer failed', { code: error.code, message: error.message })
    const missing = /not found for contractor/i.test(error.message)
    return NextResponse.json({ error: missing ? 'Offer not found' : 'Offer transition failed' }, { status: missing ? 404 : 409 })
  }

  const result = Array.isArray(data) ? data[0] : data
  if (!result) return NextResponse.json({ error: 'Offer transition returned no state' }, { status: 500 })

  const accepted = result.transition_status === 'accepted' || result.transition_status === 'already_accepted'
  return NextResponse.json({ success: accepted, ...result }, { status: accepted ? 200 : 409 })
}
