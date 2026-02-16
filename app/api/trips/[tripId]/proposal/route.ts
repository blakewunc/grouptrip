import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// PATCH /api/trips/[tripId]/proposal - Toggle proposal_enabled (organizer only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tripId } = await params

    // Verify organizer
    const { data: membership } = await supabase
      .from('trip_members')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!membership || membership.role !== 'organizer') {
      return NextResponse.json({ error: 'Only organizers can toggle proposals' }, { status: 403 })
    }

    const body = await request.json()
    const { proposal_enabled } = body

    if (typeof proposal_enabled !== 'boolean') {
      return NextResponse.json({ error: 'proposal_enabled must be a boolean' }, { status: 400 })
    }

    const { data: trip, error } = await supabase
      .from('trips')
      .update({ proposal_enabled })
      .eq('id', tripId)
      .select('id, proposal_enabled')
      .single()

    if (error) {
      console.error('Error toggling proposal:', error)
      return NextResponse.json({ error: 'Failed to toggle proposal' }, { status: 500 })
    }

    return NextResponse.json({ trip })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
