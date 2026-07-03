/**
 * TCPA compliance helpers — Section 2.8 of the blueprint.
 * One-to-one consent: HiveQuote (the platform) is the named consenting
 * party. Consent text version-controlled; every submission logs IP,
 * timestamp, form URL, and exact language shown.
 */

export const CONSENT_LANGUAGE_VERSION = 'v2-hivequote'

export const CONSENT_LANGUAGE_TEXT =
  'By submitting this form, I agree that HiveQuote and its vetted contractor ' +
  'network may contact me at the phone number provided about my project ' +
  'request via automated text messages and calls. I understand my consent is ' +
  'not required to purchase services. Message and data rates may apply. ' +
  'Reply STOP to opt out at any time.'

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1)
  return digits
}

export function isValidUsPhone(raw: string): boolean {
  return normalizePhone(raw).length === 10
}
