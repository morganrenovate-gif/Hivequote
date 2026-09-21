import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'Stripe webhook processing is disabled until the Hedy event inbox and immutable ledger are activated.',
      code: 'HEDY_STRIPE_INGRESS_NOT_ACTIVATED',
      received: false,
    },
    { status: 503 }
  )
}
