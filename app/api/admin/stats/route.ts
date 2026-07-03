import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { env } from '@/lib/env'
import { mockLeads, mockContractors, mockPayments, mockDisputes } from '@/lib/mock/store'

export const dynamic = 'force-dynamic'

/** Admin stats API. Gated by ADMIN_ACCESS_KEY header until Supabase Auth roles are wired. */
export async function GET(req: NextRequest) {
  if (env.adminAccessKey && req.headers.get('x-admin-key') !== env.adminAccessKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json({
      mock: true,
      leads_7d: mockLeads.length,
      active_contractors: mockContractors.filter((c) => c.status === 'active').length,
      revenue_cents: mockPayments
        .filter((p) => p.status === 'succeeded')
        .reduce((s, p) => s + p.amount_cents, 0),
      open_disputes: mockDisputes.filter((d) => d.status === 'open').length,
    })
  }

  const since = new Date(Date.now() - 7 * 86400000).toISOString()
  const [leads, contractors, payments, disputes] = await Promise.all([
    supabase.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', since),
    supabase.from('contractors').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('payments').select('amount_cents').eq('status', 'succeeded').gte('created_at', since),
    supabase.from('disputes').select('id', { count: 'exact', head: true }).eq('status', 'open'),
  ])

  return NextResponse.json({
    leads_7d: leads.count ?? 0,
    active_contractors: contractors.count ?? 0,
    revenue_cents: (payments.data ?? []).reduce((s, p) => s + p.amount_cents, 0),
    open_disputes: disputes.count ?? 0,
  })
}
