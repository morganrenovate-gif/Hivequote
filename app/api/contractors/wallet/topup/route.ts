import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getStripe, STRIPE_PRODUCT_NAMES } from '@/lib/stripe/client'

/**
 * Creates a Stripe Checkout session for an ACH wallet top-up.
 * ACH preferred over cards for amounts over $500 (chargeback protection).
 */
const TopupSchema = z.object({
  contractor_id: z.string(),
  amount_cents: z.number().int().min(5000).max(1000000),
  stripe_customer_id: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const parsed = TopupSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid top-up request' }, { status: 400 })
  }

  const stripe = getStripe()
  if (!stripe) {
    console.info('[mock] Wallet top-up requested:', parsed.data)
    return NextResponse.json({
      success: true,
      mock: true,
      checkout_url: '/contractor/dashboard/billing?mock_topup=success',
    })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: parsed.data.stripe_customer_id,
    payment_method_types:
      parsed.data.amount_cents >= 50000 ? ['us_bank_account'] : ['us_bank_account', 'card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: parsed.data.amount_cents,
          product_data: {
            name: STRIPE_PRODUCT_NAMES.wallet,
            description: 'Lead generation service — pre-funded lead wallet',
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      contractor_id: parsed.data.contractor_id,
      payment_type: 'wallet_topup',
    },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/contractor/dashboard/billing?topup=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/contractor/dashboard/billing?topup=cancelled`,
  })

  return NextResponse.json({ success: true, checkout_url: session.url })
}
