import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * Twilio delivery receipt handler (Section 2.2D). If a contractor
 * lead-notification SMS is not confirmed delivered within 5 minutes,
 * the n8n fallback scenario sends email. This endpoint records
 * delivery status; failures are logged for the daily audit.
 * Also handles inbound STOP for the global suppression list.
 */
export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null)
  if (!form) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const messageStatus = String(form.get('MessageStatus') ?? '')
  const to = String(form.get('To') ?? '')
  const body = String(form.get('Body') ?? '').trim().toUpperCase()
  const from = String(form.get('From') ?? '')

  const supabase = createServiceClient()
  if (!supabase) {
    console.info('[mock] Twilio webhook:', messageStatus || body, to || from)
    return NextResponse.json({ received: true, mock: true })
  }

  // Global opt-out: STOP suppresses permanently, platform-wide
  if (['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT'].includes(body)) {
    const phone = from.replace(/\D/g, '').replace(/^1/, '')
    await supabase
      .from('sms_suppression')
      .upsert({ phone, source: 'stop_reply' }, { onConflict: 'phone' })
  }

  // Delivery failures feed the monitoring stack
  if (['failed', 'undelivered'].includes(messageStatus)) {
    await supabase.from('error_log').insert({
      scenario_name: 'twilio_delivery_failure',
      error_message: `SMS ${messageStatus} to ${to}`,
      input_payload: { to, status: messageStatus },
    })
  }

  return NextResponse.json({ received: true })
}
