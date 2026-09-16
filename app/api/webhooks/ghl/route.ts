import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import {
  claimWebhookEvent,
  completeWebhookEvent,
  sha256Hex,
  verifyGhlWebhook,
} from '@/lib/webhooks/verify'

const ALLOWED_LEAD_STATUSES = new Set([
  'qualifying', 'qualified', 'nurture', 'routing', 'assigned',
  'contacted', 'won', 'lost', 'unresponsive',
])

/**
 * Authenticated GHL webhook receiver. Supabase remains HiveQuote's source of truth.
 * External webhook input may request a permitted state transition but may not bypass
 * signature verification or event idempotency.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-ghl-signature')

  if (!verifyGhlWebhook(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
  }

  const payload = JSON.parse(rawBody || 'null')
  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Webhook processing unavailable' }, { status: 503 })
  }

  const eventId = String(
    payload.webhookId ?? payload.id ?? payload.eventId ?? `body:${sha256Hex(rawBody)}`
  )
  const claim = await claimWebhookEvent(supabase, { provider: 'ghl', eventId, rawBody })
  if (claim === 'duplicate') {
    return NextResponse.json({ received: true, duplicate: true })
  }

  try {
    const leadId = payload?.customData?.supabase_lead_id ?? payload?.supabase_lead_id
    const newStatus = payload?.customData?.status ?? payload?.status

    if (!leadId || !newStatus || !ALLOWED_LEAD_STATUSES.has(String(newStatus))) {
      await completeWebhookEvent(supabase, 'ghl', eventId, 'ignored')
      return NextResponse.json({ received: true, ignored: true })
    }

    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', leadId)

    if (error) throw error

    await completeWebhookEvent(supabase, 'ghl', eventId, 'processed')
    return NextResponse.json({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown GHL webhook error'
    await completeWebhookEvent(supabase, 'ghl', eventId, 'failed', message)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
