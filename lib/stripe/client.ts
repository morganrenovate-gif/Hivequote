import Stripe from 'stripe'
import { env, isStripeConfigured } from '@/lib/env'

let cached: Stripe | null = null

/**
 * Stripe client. Null in mock mode.
 *
 * PRODUCT NAMING RULE (Section 2.1, mandatory): all products must be
 * named "Lead Generation Service — [Trade]", "Lead Generation
 * Subscription — [Tier]", "Contractor Platform Setup Fee", or
 * "Lead Wallet — HiveQuote". Never "success fee", "referral fee",
 * "performance fee", or "introduction fee" — those trigger Stripe
 * underwriting review.
 */
export function getStripe(): Stripe | null {
  if (!isStripeConfigured) return null
  if (!cached) {
    cached = new Stripe(env.stripeSecretKey, { apiVersion: '2024-06-20' })
  }
  return cached
}

export const STRIPE_PRODUCT_NAMES = {
  ppl: (trade: string) => `Lead Generation Service — ${trade}`,
  subscription: (tier: string) => `Lead Generation Subscription — ${tier}`,
  onboarding: 'Contractor Platform Setup Fee',
  wallet: 'Lead Wallet — HiveQuote',
} as const
