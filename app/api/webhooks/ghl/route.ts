import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'GHL webhook ingress is disabled until Hedy signature verification and provider-event deduplication are activated.',
      code: 'HEDY_GHL_INGRESS_NOT_ACTIVATED',
      received: false,
    },
    { status: 503 }
  )
}
