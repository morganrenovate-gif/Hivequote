import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import {
  claimWebhookEvent,
  completeWebhookEvent,
  sha256Hex,
  verifyGhlWebhook,
} from '@/lib/webhooks/verify'

// GHL may report qualification-stage state, but it is not allowed to create assignments,
// declare homeowner contact, or settle job outcomes. Those transitions have dedicated authorities.
const ALLOWED_EXTERNAL_LEAD_STATUSES = new Set([
  'qualifying', 'qualified', 'nurture', 'unresponsive',
])

/**
 * Authenticated GHL webhook receiver. Supabase remains HiveQuote's source of truth.
 * Signed GHL events may request qualification-stage transitions only.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-ghl-signature')

  if (!verifyGhlWebhook(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
  }

  let payload: Record<string, any>
  try {
    const parsed = JSON.parse(rawBody || 'null')
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('invalid object')
    payload = parsed
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Webhook processing unavailable' }, { status: 503 })
  }

  const eventId = String(
    payload.webhookId ?? payload.id ?? payload.eventId ?? `body:${sha256Hex(rawBody)}`
  )

  let claim: 'claimed' | 'duplicate'
  try {
    claim = await claimWebhookEvent(supabase, { provider: 'ghl', eventId, rawBody })
  } catch (error) {
    console.error('GHL webhook claim failed', { eventId, error })
    return NextResponse.json({ error: 'Webhook claim failed' }, { status: 409 })
  }

  if (claim === 'duplicate') {
    return NextResponse.json({ received: true, duplicate: true })
  }

  try {
    const leadId = payload?.customData?.supabase_lead_id ?? payload?.supabase_lead_id
    const newStatus = String(payload?.customData?.status ?? payload?.status ?? '')

    if (!leadId || !ALLOWED_EXTERNAL_LEAD_STATUSES.has(newStatus)) {
      await completeWebhookEvent(supabase, 'ghl', eventId, 'ignored')
      return NextResponse.json({ received: true, ignored: true })
    }

    const { data: lead, error: updateError } = await supabase
      .from('leads')
      .update({
        status: newStatus,
        qualified_at: newStatus === 'qualified' ? new Date().toISOString() : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId)
      .select('id')
      .maybeSingle()

    if (updateError) throw updateError
    if (!lead) throw new Error('lead not found')

    let routing: unknown = null
    if (newStatus === 'qualified') {
      const { data, error } = await supabase.rpc('reserve_next_lead_offer', {
        p_lead_id: leadId,
        p_offer_ttl_minutes: 60,
        p_actor: 'ghl_webhook',
        p_idempotency_key: `ghl:${eventId}:qualified`,
      })
      if (error) throw error
      routing = Array.isArray(data) ? data[0] : data
    }

    await completeWebhookEvent(supabase, 'ghl', eventId, 'processed')
    return NextResponse.json({ received: true, routing })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown GHL webhook error'
    try {
      await completeWebhookEvent(supabase, 'ghl', eventId, 'failed', message)
    } catch (completionError) {
      console.error('Could not mark GHL webhook failed', { eventId, completionError })
    }
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
