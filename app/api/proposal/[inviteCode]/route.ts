import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/proposal/[inviteCode] - Public proposal data (no auth required)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ inviteCode: string }> }
) {
  try {
    const supabase = await createClient()
    const { inviteCode } = await params

    // Fetch trip by invite code
    const { data: trip, error } = await supabase
      .from('trips')
      .select(`
        id,
        title,
        destination,
        start_date,
        end_date,
        description,
        budget_total,
        trip_type,
        status,
        proposal_enabled,
        invite_code,
        trip_members(id, role, rsvp_status)
      `)
      .eq('invite_code', inviteCode)
      .single()

    if (error || !trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    if (!trip.proposal_enabled) {
      return NextResponse.json({ error: 'Proposal not available' }, { status: 404 })
    }

    // Fetch budget categories
    const { data: categories } = await supabase
      .from('budget_categories')
      .select('id, name, estimated_cost, split_type')
      .eq('trip_id', trip.id)
      .order('created_at', { ascending: true })

    // Fetch itinerary highlights (first 10 items)
    const { data: itinerary } = await supabase
      .from('itinerary_items')
      .select('id, title, description, date, time, location')
      .eq('trip_id', trip.id)
      .order('date', { ascending: true })
      .order('time', { ascending: true })
      .limit(10)

    const memberCount = trip.trip_members?.length || 0
    const acceptedCount = trip.trip_members?.filter((m: any) => m.rsvp_status === 'accepted').length || 0

    return NextResponse.json({
      trip: {
        title: trip.title,
        destination: trip.destination,
        start_date: trip.start_date,
        end_date: trip.end_date,
        description: trip.description,
        budget_total: trip.budget_total,
        trip_type: trip.trip_type,
        status: trip.status,
        invite_code: trip.invite_code,
        member_count: memberCount,
        accepted_count: acceptedCount,
      },
      categories: categories || [],
      itinerary: itinerary || [],
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
