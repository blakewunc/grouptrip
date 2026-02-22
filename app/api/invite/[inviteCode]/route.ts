import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/invite/[inviteCode] - Fetch trip by invite code (public, no auth required)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ inviteCode: string }> }
) {
  try {
    const supabase = createServiceClient()
    const { inviteCode } = await params

    // Fetch trip by invite code (public access)
    const { data: trip, error } = await supabase
      .from('trips')
      .select(
        `
        id,
        title,
        destination,
        start_date,
        end_date,
        description,
        status,
        invite_code,
        created_at
      `
      )
      .eq('invite_code', inviteCode)
      .single()

    if (error || !trip) {
      return NextResponse.json(
        { error: 'Trip not found or invite code is invalid' },
        { status: 404 }
      )
    }

    return NextResponse.json({ trip })
  } catch (error) {
    console.error('Error fetching trip by invite code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
