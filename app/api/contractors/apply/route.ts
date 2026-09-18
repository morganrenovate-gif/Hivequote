import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const ApplySchema = z.object({
  business_name: z.string().min(1),
  owner_name: z.string().min(1),
  phone: z.string().min(10),
  email: z.string().email(),
  license_number: z.string().optional().default(''),
  trades: z.array(z.string()).min(1),
  zips: z.string().min(1),
  capacity: z.enum(['1-2', '3+', 'full']),
})

export async function POST(req: NextRequest) {
  const parsed = ApplySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid application data' }, { status: 400 })
  }

  return NextResponse.json(
    {
      error: 'Contractor onboarding is temporarily unavailable while HiveQuote activates Hedy-native identity and contractor records.',
      code: 'HEDY_CONTRACTOR_ONBOARDING_NOT_ACTIVATED',
      accepted: false,
      waitlisted: parsed.data.capacity === 'full',
    },
    { status: 503 }
  )
}
