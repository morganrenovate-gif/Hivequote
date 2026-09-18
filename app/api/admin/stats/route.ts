import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!env.adminAccessKey) {
    return NextResponse.json({ error: 'Admin access is not configured', code: 'ADMIN_GATE_NOT_CONFIGURED' }, { status: 503 })
  }
  if (req.headers.get('x-admin-key') !== env.adminAccessKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json(
    {
      error: 'Operational statistics are unavailable until Hedy admin data access is activated.',
      code: 'HEDY_ADMIN_DATA_NOT_ACTIVATED',
    },
    { status: 503 }
  )
}
