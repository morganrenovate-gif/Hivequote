import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authorizedInternalRequest } from '@/lib/auth/internal'
import { createServiceClient } from '@/lib/supabase/server'

const ClaimSchema = z.object({
  lease_seconds: z.number().int().min(30).max(1800).default(120),
  worker: z.string().min(2).max(80).default('automation'),
})

/**
 * Delivery workers may claim a prepared notification job. They never choose a contractor
 * and never create routing, assignment, or billing state.
 */
export async function POST(req: NextRequest) {
  if (!authorizedInternalRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = ClaimSchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const supabase = createServiceClient()
  if (!supabase) return NextResponse.json({ error: 'Notification service unavailable' }, { status: 503 })

  const { data, error } = await supabase.rpc('claim_next_routing_notification', {
    p_lease_seconds: parsed.data.lease_seconds,
    p_worker: parsed.data.worker,
  })

  if (error) {
    console.error('claim_next_routing_notification failed', { code: error.code, message: error.message })
    return NextResponse.json({ error: 'Notification claim failed' }, { status: 500 })
  }

  const job = Array.isArray(data) ? data[0] : data
  if (!job) return NextResponse.json({ success: true, job: null })

  return NextResponse.json({ success: true, job })
}
