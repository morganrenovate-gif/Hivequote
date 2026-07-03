import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * GHL webhook: fired when a lead is tagged "qualified" (replied YES to
 * the 30-day intent SMS). Marks the lead qualified in Supabase; the
 * n8n/Make routing scenario picks it up from there via DB webhook.
 */
const QualifySchema = z.object({
  supabase_lead_id: z.string(),
  qualification_reply: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const parsed = QualifySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const supabase = createServiceClient()
  if (!supabase) {
    console.info('[mock] Lead qualified:', parsed.data.supabase_lead_id)
    return NextResponse.json({ success: true, mock: true })
  }

  const { error } = await supabase
    .from('leads')
    .update({
      status: 'qualified',
      qualification_reply: parsed.data.qualification_reply ?? 'YES',
      qualified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.supabase_lead_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
