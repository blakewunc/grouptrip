import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/trips/[tripId]/ski/rentals - Get all equipment rentals for a trip
export async function GET(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a trip member
    const { data: membership } = await supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch rentals with user profiles
    const { data: rentals, error } = await supabase
      .from('ski_rentals')
      .select(`
        *,
        profiles:user_id (
          id,
          display_name,
          email
        )
      `)
      .eq('trip_id', tripId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform data
    const transformedRentals = rentals?.map((rental: any) => ({
      ...rental,
      user_name: rental.profiles?.display_name || rental.profiles?.email || 'Unknown',
      profiles: undefined,
    }))

    return NextResponse.json({ rentals: transformedRentals })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/trips/[tripId]/ski/rentals - Create equipment rental
export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a trip member
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
    const { needs_skis, needs_snowboard, needs_boots, needs_helmet, boot_size, height_cm, weight_kg, notes } = body

    // Create rental
    const { data: rental, error } = await supabase
      .from('ski_rentals')
      .insert({
        trip_id: tripId,
        user_id: user.id,
        needs_skis,
        needs_snowboard,
        needs_boots,
        needs_helmet,
        boot_size,
        height_cm,
        weight_kg,
        notes,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ rental }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/trips/[tripId]/ski/rentals - Update equipment rental
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { needs_skis, needs_snowboard, needs_boots, needs_helmet, boot_size, height_cm, weight_kg, notes } = body

    // Update rental (for current user)
    const { data: rental, error } = await supabase
      .from('ski_rentals')
      .update({
        needs_skis,
        needs_snowboard,
        needs_boots,
        needs_helmet,
        boot_size,
        height_cm,
        weight_kg,
        notes,
      })
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ rental })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
