import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authorizedInternalRequest } from '@/lib/auth/internal'
import { createServiceClient } from '@/lib/supabase/server'

const CompleteSchema = z.object({
  outbox_id: z.string().uuid(),
  success: z.boolean(),
  provider: z.string().max(50).optional(),
  provider_message_id: z.string().max(255).optional(),
  error: z.string().max(1000).optional(),
  worker: z.string().min(2).max(80).default('automation'),
})

/** Records only the delivery result for an already-authorized notification job. */
export async function POST(req: NextRequest) {
  if (!authorizedInternalRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = CompleteSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const supabase = createServiceClient()
  if (!supabase) return NextResponse.json({ error: 'Notification service unavailable' }, { status: 503 })

  const { data, error } = await supabase.rpc('complete_routing_notification', {
    p_outbox_id: parsed.data.outbox_id,
    p_success: parsed.data.success,
    p_provider: parsed.data.provider ?? null,
    p_provider_message_id: parsed.data.provider_message_id ?? null,
    p_error: parsed.data.error ?? null,
    p_worker: parsed.data.worker,
  })

  if (error) {
    console.error('complete_routing_notification failed', { code: error.code, message: error.message })
    return NextResponse.json({ error: 'Notification completion failed' }, { status: 409 })
  }

  return NextResponse.json({ success: data === 'sent' || data === 'already_sent', status: data })
}
