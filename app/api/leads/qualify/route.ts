import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'Qualification callbacks are disabled until signed, idempotent Hedy ingress is activated.',
      code: 'HEDY_QUALIFICATION_INGRESS_NOT_ACTIVATED',
      accepted: false,
    },
    { status: 503 }
  )
}
