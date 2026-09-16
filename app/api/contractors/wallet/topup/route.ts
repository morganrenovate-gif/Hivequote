import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getStripe, STRIPE_PRODUCT_NAMES } from '@/lib/stripe/client'
import { requireContractor } from '@/lib/auth/contractor'
import { authorizedMutationOrigin } from '@/lib/security/request'
import { env } from '@/lib/env'

const TopupSchema = z.object({
  amount_cents: z.number().int().min(5000).max(1000000),
})

export async function POST(req: NextRequest) {
  if (!authorizedMutationOrigin(req)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }

  const contractor = await requireContractor(req)
  if (!contractor) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const parsed = TopupSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid top-up request' }, { status: 400 })
  }

  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({ error: 'Billing is unavailable' }, { status: 503 })
  }
  if (!contractor.stripeCustomerId) {
    return NextResponse.json({ error: 'Billing profile is incomplete' }, { status: 409 })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: contractor.stripeCustomerId,
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
      contractor_id: contractor.contractorId,
      auth_user_id: contractor.userId,
      payment_type: 'wallet_topup',
    },
    success_url: `${env.siteUrl}/contractor/dashboard/billing?topup=success`,
    cancel_url: `${env.siteUrl}/contractor/dashboard/billing?topup=cancelled`,
  })

  return NextResponse.json({ success: true, checkout_url: session.url })
}
