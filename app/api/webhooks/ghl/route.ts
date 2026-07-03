import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * Generic GHL webhook receiver. GHL fires this on pipeline stage
 * changes; we sync status back to Supabase (single source of truth).
 * Routing itself happens in n8n/Make via incoming webhooks — never
 * polling (Section 2.2C).
 */
export async function POST(req: NextRequest) {
  const payload = await req.json().catch(() => null)
  if (!payload) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const supabase = createServiceClient()
  if (!supabase) {
    console.info('[mock] GHL webhook:', payload?.type ?? 'unknown')
    return NextResponse.json({ received: true, mock: true })
  }

  const leadId = payload?.customData?.supabase_lead_id ?? payload?.supabase_lead_id
  const newStatus = payload?.customData?.status ?? payload?.status

  const allowed = [
    'qualifying', 'qualified', 'nurture', 'routing', 'assigned',
    'contacted', 'won', 'lost', 'unresponsive',
  ]

  if (leadId && newStatus && allowed.includes(newStatus)) {
    await supabase
      .from('leads')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', leadId)
  }

  return NextResponse.json({ received: true })
}
