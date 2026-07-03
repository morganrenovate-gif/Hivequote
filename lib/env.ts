/**
 * Integration flags. Every external system is optional — the app runs
 * fully in mock mode until real keys are provided in .env.local.
 */
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  ghlApiKey: process.env.GHL_API_KEY ?? '',
  ghlLocationId: process.env.GHL_LOCATION_ID ?? '',
  smsActive: process.env.SMS_ACTIVE === 'true',
  adminAccessKey: process.env.ADMIN_ACCESS_KEY ?? '',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hivequote.com',
}

export const isSupabaseConfigured = Boolean(
  env.supabaseUrl && env.supabaseServiceRoleKey
)
export const isStripeConfigured = Boolean(env.stripeSecretKey)
export const isGhlConfigured = Boolean(env.ghlApiKey && env.ghlLocationId)

/**
 * A2P 10DLC gate — Section 2.8 of the blueprint. No SMS is ever sent
 * unless registration is approved AND SMS_ACTIVE=true.
 */
export const canSendSms = () => env.smsActive
