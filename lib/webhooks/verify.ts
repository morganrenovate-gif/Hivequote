import crypto from 'crypto'
import { validateRequest as validateTwilioRequest } from 'twilio'
import { env } from '@/lib/env'

const GHL_ED25519_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAi2HR1srL4o18O8BRa7gVJY7G7bupbN3H9AwJrHCDiOg=
-----END PUBLIC KEY-----`

export function sha256Hex(value: string): string {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex')
}

export function verifyGhlWebhook(rawBody: string, signature: string | null): boolean {
  if (!signature || signature === 'N/A') return false
  try {
    return crypto.verify(
      null,
      Buffer.from(rawBody, 'utf8'),
      GHL_ED25519_PUBLIC_KEY,
      Buffer.from(signature, 'base64')
    )
  } catch {
    return false
  }
}

export function getCanonicalWebhookUrl(reqUrl: string): string {
  const incoming = new URL(reqUrl)
  const base = new URL(env.siteUrl)
  base.pathname = incoming.pathname
  base.search = incoming.search
  return base.toString()
}

export function verifyTwilioWebhook(
  reqUrl: string,
  signature: string | null,
  params: Record<string, string>
): boolean {
  if (!env.twilioAuthToken || !signature) return false
  return validateTwilioRequest(
    env.twilioAuthToken,
    signature,
    getCanonicalWebhookUrl(reqUrl),
    params
  )
}

export async function claimWebhookEvent(
  supabase: NonNullable<ReturnType<typeof import('@/lib/supabase/server').createServiceClient>>,
  input: {
    provider: string
    eventId: string
    rawBody: string
  }
): Promise<'claimed' | 'duplicate'> {
  const { error } = await supabase.from('webhook_events').insert({
    provider: input.provider,
    event_id: input.eventId,
    payload_sha256: sha256Hex(input.rawBody),
    status: 'processing',
  })

  if (!error) return 'claimed'
  if (error.code === '23505') return 'duplicate'
  throw new Error(`Could not claim webhook event: ${error.message}`)
}

export async function completeWebhookEvent(
  supabase: NonNullable<ReturnType<typeof import('@/lib/supabase/server').createServiceClient>>,
  provider: string,
  eventId: string,
  status: 'processed' | 'ignored' | 'failed',
  errorText?: string
): Promise<void> {
  await supabase
    .from('webhook_events')
    .update({
      status,
      processed_at: new Date().toISOString(),
      error_text: errorText ?? null,
    })
    .eq('provider', provider)
    .eq('event_id', eventId)
}
