import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireContractor } from '@/lib/auth/contractor'
import { authorizedMutationOrigin } from '@/lib/security/request'
import { createServiceClient } from '@/lib/supabase/server'

type RouteContext = { params: { assignmentId: string } }

/** Records first homeowner contact for the authenticated contractor's active assignment. */
export async function POST(req: NextRequest, { params }: RouteContext) {
  if (!authorizedMutationOrigin(req)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }

  const contractor = await requireContractor(req)
  if (!contractor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const assignmentId = z.string().uuid().safeParse(params.assignmentId)
  if (!assignmentId.success) return NextResponse.json({ error: 'Invalid assignment' }, { status: 400 })

  const supabase = createServiceClient()
  if (!supabase) return NextResponse.json({ error: 'Lead service unavailable' }, { status: 503 })

  const { data, error } = await supabase.rpc('mark_assignment_contacted', {
    p_assignment_id: assignmentId.data,
    p_contractor_id: contractor.contractorId,
    p_actor: `contractor:${contractor.userId}`,
  })

  if (error) {
    console.error('mark_assignment_contacted failed', { code: error.code, message: error.message })
    const missing = /not found for contractor/i.test(error.message)
    return NextResponse.json({ error: missing ? 'Assignment not found' : 'Contact transition failed' }, { status: missing ? 404 : 409 })
  }

  const result = Array.isArray(data) ? data[0] : data
  if (!result) return NextResponse.json({ error: 'Contact transition returned no state' }, { status: 500 })

  const ok = result.transition_status === 'contacted' || result.transition_status === 'already_contacted'
  return NextResponse.json({ success: ok, ...result }, { status: ok ? 200 : 409 })
}
