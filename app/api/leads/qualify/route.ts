import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { env } from '@/lib/env'

const QualifySchema = z.object({
  supabase_lead_id: z.string().uuid(),
  qualification_reply: z.string().max(500).optional(),
})

function authorizedInternalRequest(req: NextRequest): boolean {
  const supplied = req.headers.get('x-hivequote-internal-key') ?? ''
  const expected = env.internalWebhookSecret
  if (!supplied || !expected) return false
  const a = Buffer.from(supplied)
  const b = Buffer.from(expected)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

/** Internal automation transition. Public callers cannot mark a lead qualified. */
export async function POST(req: NextRequest) {
  if (!authorizedInternalRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = QualifySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Qualification service unavailable' }, { status: 503 })
  }

  const { data, error } = await supabase
    .from('leads')
    .update({
      status: 'qualified',
      qualification_reply: parsed.data.qualification_reply ?? 'YES',
      qualified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.supabase_lead_id)
    .in('status', ['new', 'qualifying', 'nurture'])
    .select('id')
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) {
    return NextResponse.json({ error: 'Lead not found or transition not allowed' }, { status: 409 })
  }

  return NextResponse.json({ success: true, lead_id: data.id })
}
