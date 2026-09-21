import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const TopupSchema = z.object({
  amount_cents: z.number().int().min(5000).max(1000000),
})

export async function POST(req: NextRequest) {
  const parsed = TopupSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid top-up request' }, { status: 400 })
  }

  return NextResponse.json(
    {
      error: 'Wallet funding is disabled until authenticated Hedy contractor identity and an idempotent ledger are activated.',
      code: 'HEDY_WALLET_NOT_ACTIVATED',
      checkout_created: false,
    },
    { status: 503 }
  )
}
