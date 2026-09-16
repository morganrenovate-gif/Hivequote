import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authorizedInternalRequest } from '@/lib/auth/internal'
import { createServiceClient } from '@/lib/supabase/server'

const RescueSchema = z.object({
  limit: z.number().int().min(1).max(500).default(50),
  reroute: z.boolean().default(true),
  offer_ttl_minutes: z.number().int().min(5).max(1440).default(60),
})

/**
 * Releases expired offers and accepted-but-uncontacted assignments.
 * When reroute=true, each released lead is atomically offered to the next eligible contractor.
 */
export async function POST(req: NextRequest) {
  if (!authorizedInternalRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = RescueSchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Routing service unavailable' }, { status: 503 })
  }

  const { data: released, error: releaseError } = await supabase.rpc('release_overdue_routing_work', {
    p_limit: parsed.data.limit,
    p_actor: 'rescue_sweep',
  })

  if (releaseError) {
    console.error('release_overdue_routing_work failed', {
      code: releaseError.code,
      message: releaseError.message,
    })
    return NextResponse.json({ error: 'Rescue sweep failed' }, { status: 500 })
  }

  const releases = Array.isArray(released) ? released : []
  if (!parsed.data.reroute || releases.length === 0) {
    return NextResponse.json({ success: true, released: releases, rerouted: [] })
  }

  const rerouted: unknown[] = []
  for (const release of releases) {
    const leadId = typeof release?.lead_id === 'string' ? release.lead_id : null
    if (!leadId) continue

    const { data, error } = await supabase.rpc('reserve_next_lead_offer', {
      p_lead_id: leadId,
      p_offer_ttl_minutes: parsed.data.offer_ttl_minutes,
      p_actor: 'rescue_sweep',
      p_idempotency_key: `rescue:${leadId}:${release.release_reason ?? 'released'}`,
    })

    if (error) {
      rerouted.push({ lead_id: leadId, status: 'failed', code: error.code })
      continue
    }

    const result = Array.isArray(data) ? data[0] : data
    rerouted.push({ lead_id: leadId, ...(result ?? { route_status: 'no_state' }) })
  }

  return NextResponse.json({ success: true, released: releases, rerouted })
}
