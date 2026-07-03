import { env, isGhlConfigured } from '@/lib/env'

/**
 * GoHighLevel API wrapper. No-ops (with console log) in mock mode so
 * lead submission never fails while GHL is unconfigured.
 */
interface GhlContactInput {
  firstName: string
  lastName?: string
  phone: string
  email?: string
  customFields?: Record<string, string>
  tags?: string[]
}

export async function ghlCreateContact(
  input: GhlContactInput
): Promise<{ ok: boolean; contactId?: string; mock?: boolean }> {
  if (!isGhlConfigured) {
    console.info('[mock] GHL contact would be created:', input.phone, input.tags)
    return { ok: true, mock: true }
  }

  const res = await fetch('https://services.leadconnectorhq.com/contacts/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.ghlApiKey}`,
      'Content-Type': 'application/json',
      Version: '2021-07-28',
    },
    body: JSON.stringify({
      locationId: env.ghlLocationId,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      email: input.email,
      tags: input.tags,
      customFields: input.customFields
        ? Object.entries(input.customFields).map(([key, value]) => ({ key, value }))
        : undefined,
    }),
  })

  if (!res.ok) {
    console.error('GHL contact creation failed', res.status, await res.text())
    return { ok: false }
  }
  const data = await res.json()
  return { ok: true, contactId: data?.contact?.id }
}
