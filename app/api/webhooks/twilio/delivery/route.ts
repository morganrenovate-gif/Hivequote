import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'Twilio webhook ingress is disabled until Hedy signature verification and suppression/event storage are activated.',
      code: 'HEDY_TWILIO_INGRESS_NOT_ACTIVATED',
      received: false,
    },
    { status: 503 }
  )
}
