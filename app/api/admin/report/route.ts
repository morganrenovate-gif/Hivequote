import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { env } from '@/lib/env'

/**
 * Daily audit report data (Section 2.2I). n8n/Make calls this at
 * 7 AM MT and emails the founder the result — the mandatory
 * 2-minute daily check.
 */
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (env.adminAccessKey && req.headers.get('x-admin-key') !== env.adminAccessKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json({
      mock: true,
      period_hours: 24,
      leads_received: 3,
      leads_routed: 2,
      leads_unrouted: 1,
      acceptance_rate_pct: 100,
      failed_scenarios: 0,
      delivery_failures: 1,
    })
  }

  const since = new Date(Date.now() - 86400000).toISOString()
  const [received, routed, errors] = await Promise.all([
    supabase.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', since),
    supabase.from('lead_assignments').select('id', { count: 'exact', head: true }).gte('created_at', since),
    supabase.from('error_log').select('scenario_name').gte('occurred_at', since).eq('resolved', false),
  ])

  return NextResponse.json({
    period_hours: 24,
    leads_received: received.count ?? 0,
    leads_routed: routed.count ?? 0,
    leads_unrouted: Math.max((received.count ?? 0) - (routed.count ?? 0), 0),
    failed_scenarios: (errors.data ?? []).length,
    failures: errors.data ?? [],
  })
}
