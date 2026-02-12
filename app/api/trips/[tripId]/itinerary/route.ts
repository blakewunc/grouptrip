import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/trips/:tripId/itinerary - Fetch all itinerary items for a trip
export async function GET(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tripId } = await params

    // Verify user is a member of this trip
    const { data: member } = await supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Not authorized to view this trip' }, { status: 403 })
    }

    // Fetch itinerary items
    const { data: items, error } = await supabase
      .from('itinerary_items')
      .select(`
        id,
        title,
        description,
        location,
        date,
        time,
        sort_order,
        created_at,
        created_by,
        profiles!itinerary_items_created_by_fkey (
          id,
          email,
          display_name
        )
      `)
      .eq('trip_id', tripId)
      .order('date', { ascending: true })
      .order('time', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({ items: items || [] })
  } catch (error: any) {
    console.error('Itinerary fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch itinerary' },
      { status: 500 }
    )
  }
}

// POST /api/trips/:tripId/itinerary - Create a new itinerary item
export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tripId } = await params
    const body = await request.json()
    const { title, description, location, date, time } = body

    // Verify user is a member of this trip
    const { data: member } = await supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json(
        { error: 'Not authorized to add items to this trip' },
        { status: 403 }
      )
    }

    // Validate input
    if (!title || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: title, date' },
        { status: 400 }
      )
    }

    // Create itinerary item
    const { data: item, error: itemError } = await supabase
      .from('itinerary_items')
      .insert({
        trip_id: tripId,
        created_by: user.id,
        title,
        description,
        location,
        date,
        time,
      })
      .select(`
        id,
        title,
        description,
        location,
        date,
        time,
        sort_order,
        created_at,
        created_by,
        profiles!itinerary_items_created_by_fkey (
          id,
          email,
          display_name
        )
      `)
      .single()

    if (itemError) {
      throw itemError
    }

    return NextResponse.json({ item }, { status: 201 })
  } catch (error: any) {
    console.error('Itinerary creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create itinerary item' },
      { status: 500 }
    )
  }
}
