/**
 * HiveQuote environment configuration.
 *
 * Hedy is the authoritative backend. Missing integrations fail closed.
 */
export const env = {
  hedyBackendOrigin: process.env.HEDY_BACKEND_ORIGIN ?? '',
  hedyEnvironment: process.env.HEDY_ENVIRONMENT ?? 'staging',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  ghlApiKey: process.env.GHL_API_KEY ?? '',
  ghlLocationId: process.env.GHL_LOCATION_ID ?? '',
  smsActive: process.env.SMS_ACTIVE === 'true',
  adminAccessKey: process.env.ADMIN_ACCESS_KEY ?? '',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hivequote.com',
}

export const isHedyConfigured = Boolean(env.hedyBackendOrigin)
export const isStripeConfigured = Boolean(env.stripeSecretKey)
export const isGhlConfigured = Boolean(env.ghlApiKey && env.ghlLocationId)
export const canSendSms = () => env.smsActive
