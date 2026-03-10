import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/trips/[tripId]/transportation - List all transportation entries
export async function GET(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: membership } = await supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: transportation, error } = await supabase
      .from('transportation')
      .select(`
        id,
        type,
        departure_time,
        departure_location,
        arrival_time,
        arrival_location,
        seats_available,
        notes,
        created_by,
        created_at,
        profiles!transportation_created_by_fkey (
          id,
          display_name,
          email
        )
      `)
      .eq('trip_id', tripId)
      .order('departure_time', { ascending: true })

    if (error) throw error

    return NextResponse.json({ transportation: transportation || [] })
  } catch (error: any) {
    console.error('Transportation fetch error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch transportation' }, { status: 500 })
  }
}

// POST /api/trips/[tripId]/transportation - Add a transportation entry
export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: membership } = await supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { type, departure_time, departure_location, arrival_time, arrival_location, seats_available, notes } = body

    if (!type) {
      return NextResponse.json({ error: 'Type is required' }, { status: 400 })
    }

    const { data: entry, error } = await supabase
      .from('transportation')
      .insert({
        trip_id: tripId,
        created_by: user.id,
        type,
        departure_time: departure_time || null,
        departure_location: departure_location || null,
        arrival_time: arrival_time || null,
        arrival_location: arrival_location || null,
        seats_available: seats_available ? parseInt(seats_available) : null,
        notes: notes || null,
      })
      .select(`
        id,
        type,
        departure_time,
        departure_location,
        arrival_time,
        arrival_location,
        seats_available,
        notes,
        created_by,
        created_at,
        profiles!transportation_created_by_fkey (
          id,
          display_name,
          email
        )
      `)
      .single()

    if (error) throw error

    return NextResponse.json({ entry }, { status: 201 })
  } catch (error: any) {
    console.error('Transportation create error:', error)
    return NextResponse.json({ error: error.message || 'Failed to add transportation' }, { status: 500 })
  }
}
