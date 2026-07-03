import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import { createServiceClient } from '@/lib/supabase/server'
import { env } from '@/lib/env'

/**
 * Stripe webhook: records payments and updates contractor wallets.
 * Handles: checkout.session.completed (wallet top-ups),
 * invoice.paid (retainers), payment_intent.payment_failed.
 */
export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const supabase = createServiceClient()

  if (!stripe || !env.stripeWebhookSecret) {
    console.info('[mock] Stripe webhook received (unverified, ignored)')
    return NextResponse.json({ received: true, mock: true })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event
  try {
    const payload = await req.text()
    event = stripe.webhooks.constructEvent(payload, signature, env.stripeWebhookSecret)
  } catch (e) {
    console.error('Stripe webhook signature verification failed', e)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (!supabase) return NextResponse.json({ received: true })

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const contractorId = session.metadata?.contractor_id
      const amount = session.amount_total ?? 0
      if (contractorId && session.metadata?.payment_type === 'wallet_topup') {
        const { data: contractor } = await supabase
          .from('contractors')
          .select('wallet_balance_cents')
          .eq('id', contractorId)
          .single()
        if (contractor) {
          await supabase
            .from('contractors')
            .update({
              wallet_balance_cents: contractor.wallet_balance_cents + amount,
              updated_at: new Date().toISOString(),
            })
            .eq('id', contractorId)
        }
        await supabase.from('payments').insert({
          contractor_id: contractorId,
          stripe_payment_intent_id: String(session.payment_intent ?? session.id),
          amount_cents: amount,
          payment_type: 'wallet_topup',
          payment_method: 'ach',
          status: 'succeeded',
          paid_at: new Date().toISOString(),
        })
      }
      break
    }
    case 'invoice.paid': {
      const invoice = event.data.object
      const contractorId = invoice.metadata?.contractor_id
      if (contractorId) {
        await supabase.from('payments').insert({
          contractor_id: contractorId,
          stripe_payment_intent_id: String(invoice.id),
          amount_cents: invoice.amount_paid,
          payment_type: 'retainer',
          payment_method: 'ach',
          status: 'succeeded',
          paid_at: new Date().toISOString(),
        })
      }
      break
    }
    case 'payment_intent.payment_failed': {
      await supabase.from('error_log').insert({
        scenario_name: 'stripe_payment_failed',
        error_message: `Payment failed: ${event.data.object.id}`,
        input_payload: { event_id: event.id },
      })
      break
    }
    default:
      break
  }

  return NextResponse.json({ received: true })
}
