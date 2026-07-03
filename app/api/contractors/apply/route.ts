import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { normalizePhone } from '@/lib/utils/tcpa'

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

  // Capacity gate (Section 2.2H): fully-booked contractors go to the
  // waitlist — never onboard a contractor who can't take work.
  const waitlisted = parsed.data.capacity === 'full'
  const [first, ...rest] = parsed.data.owner_name.trim().split(/\s+/)

  const supabase = createServiceClient()
  if (!supabase) {
    console.info('[mock] Contractor application:', parsed.data.business_name, { waitlisted })
    return NextResponse.json({ success: true, waitlisted, mock: true })
  }

  const { data: contractor, error } = await supabase
    .from('contractors')
    .insert({
      business_name: parsed.data.business_name,
      owner_first_name: first,
      owner_last_name: rest.join(' '),
      phone: normalizePhone(parsed.data.phone),
      email: parsed.data.email,
      license_number: parsed.data.license_number || null,
      status: waitlisted ? 'capacity_waitlist' : 'pending',
      capacity_status: waitlisted ? 'waitlist' : 'available',
      notes: `Applied via web. Trades: ${parsed.data.trades.join(', ')}. ZIPs: ${parsed.data.zips}`,
    })
    .select()
    .single()

  if (error) {
    console.error('Contractor insert failed:', error.message)
    return NextResponse.json({ error: 'Could not save application' }, { status: 500 })
  }

  return NextResponse.json({ success: true, waitlisted, contractor_id: contractor.id })
}
