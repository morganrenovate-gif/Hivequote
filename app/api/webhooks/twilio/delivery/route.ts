import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import {
  claimWebhookEvent,
  completeWebhookEvent,
  sha256Hex,
  verifyTwilioWebhook,
} from '@/lib/webhooks/verify'

function formToRecord(form: FormData): Record<string, string> {
  const params: Record<string, string> = {}
  for (const [key, value] of form.entries()) {
    if (typeof value === 'string') params[key] = value
  }
  return params
}

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null)
  if (!form) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const params = formToRecord(form)
  if (!verifyTwilioWebhook(req.url, req.headers.get('x-twilio-signature'), params)) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
  }

  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Webhook processing unavailable' }, { status: 503 })
  }

  const rawForHash = JSON.stringify(Object.keys(params).sort().map((key) => [key, params[key]]))
  const messageSid = params.MessageSid || params.SmsSid || ''
  const messageStatus = params.MessageStatus || ''
  const body = (params.Body || '').trim().toUpperCase()
  const eventId = messageSid
    ? `${messageSid}:${messageStatus || body || 'callback'}`
    : `body:${sha256Hex(rawForHash)}`

  const claim = await claimWebhookEvent(supabase, {
    provider: 'twilio',
    eventId,
    rawBody: rawForHash,
  })
  if (claim === 'duplicate') {
    return NextResponse.json({ received: true, duplicate: true })
  }

  try {
    const to = params.To || ''
    const from = params.From || ''

    if (['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT'].includes(body)) {
      const phone = from.replace(/\D/g, '').replace(/^1/, '')
      const { error } = await supabase
        .from('sms_suppression')
        .upsert({ phone, source: 'stop_reply' }, { onConflict: 'phone' })
      if (error) throw error
    }

    if (['failed', 'undelivered'].includes(messageStatus)) {
      const { error } = await supabase.from('error_log').insert({
        scenario_name: 'twilio_delivery_failure',
        error_message: `SMS ${messageStatus} to ${to}`,
        input_payload: { to, status: messageStatus, message_sid: messageSid },
      })
      if (error) throw error
    }

    await completeWebhookEvent(supabase, 'twilio', eventId, 'processed')
    return NextResponse.json({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Twilio webhook error'
    await completeWebhookEvent(supabase, 'twilio', eventId, 'failed', message)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
