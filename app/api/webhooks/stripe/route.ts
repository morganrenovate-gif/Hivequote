import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe/client'
import { createServiceClient } from '@/lib/supabase/server'
import { env } from '@/lib/env'
import { claimWebhookEvent, completeWebhookEvent } from '@/lib/webhooks/verify'

async function fundWalletFromCheckout(
  supabase: NonNullable<ReturnType<typeof createServiceClient>>,
  event: Stripe.Event,
  session: Stripe.Checkout.Session
) {
  const contractorId = session.metadata?.contractor_id
  const amount = session.amount_total ?? 0
  if (!contractorId || session.metadata?.payment_type !== 'wallet_topup' || amount <= 0) return false

  const { error: ledgerError } = await supabase.rpc('post_wallet_entry', {
    p_contractor_id: contractorId,
    p_amount_cents: amount,
    p_entry_type: 'funding',
    p_source_provider: 'stripe',
    p_source_event_id: event.id,
    p_source_object_id: session.id,
    p_lead_id: null,
    p_notes: 'Stripe wallet top-up',
    p_created_by: 'stripe_webhook',
  })
  if (ledgerError) throw ledgerError

  const paymentIntentId = String(session.payment_intent ?? session.id)
  const { error: paymentError } = await supabase.from('payments').insert({
    contractor_id: contractorId,
    stripe_payment_intent_id: paymentIntentId,
    amount_cents: amount,
    payment_type: 'wallet_topup',
    payment_method: 'stripe',
    status: 'succeeded',
    paid_at: new Date().toISOString(),
  })
  if (paymentError && paymentError.code !== '23505') throw paymentError

  return true
}

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const supabase = createServiceClient()
  if (!stripe || !env.stripeWebhookSecret || !supabase) {
    return NextResponse.json({ error: 'Webhook processing unavailable' }, { status: 503 })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  const payload = await req.text()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(payload, signature, env.stripeWebhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const claim = await claimWebhookEvent(supabase, {
    provider: 'stripe',
    eventId: event.id,
    rawBody: payload,
  })
  if (claim === 'duplicate') {
    return NextResponse.json({ received: true, duplicate: true })
  }

  try {
    let handled = false

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        // Card payments can already be paid here. ACH is asynchronous and must wait.
        if (session.payment_status === 'paid') {
          handled = await fundWalletFromCheckout(supabase, event, session)
        }
        break
      }
      case 'checkout.session.async_payment_succeeded': {
        handled = await fundWalletFromCheckout(
          supabase,
          event,
          event.data.object as Stripe.Checkout.Session
        )
        break
      }
      case 'checkout.session.async_payment_failed':
      case 'payment_intent.payment_failed': {
        const object = event.data.object as { id?: string }
        const { error } = await supabase.from('error_log').insert({
          scenario_name: 'stripe_payment_failed',
          error_message: `Stripe payment failed: ${object.id ?? 'unknown'}`,
          input_payload: { event_id: event.id, event_type: event.type },
        })
        if (error) throw error
        handled = true
        break
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const contractorId = invoice.metadata?.contractor_id
        if (contractorId) {
          const { error } = await supabase.from('payments').insert({
            contractor_id: contractorId,
            stripe_payment_intent_id: String(invoice.id),
            amount_cents: invoice.amount_paid,
            payment_type: 'retainer',
            payment_method: 'stripe',
            status: 'succeeded',
            paid_at: new Date().toISOString(),
          })
          if (error && error.code !== '23505') throw error
          handled = true
        }
        break
      }
      default:
        break
    }

    await completeWebhookEvent(supabase, 'stripe', event.id, handled ? 'processed' : 'ignored')
    return NextResponse.json({ received: true, handled })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Stripe webhook error'
    await completeWebhookEvent(supabase, 'stripe', event.id, 'failed', message)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
