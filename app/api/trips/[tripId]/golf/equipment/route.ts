import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/trips/[tripId]/golf/equipment - Get all equipment needs for a trip
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

    // Fetch equipment with user profiles
    const { data: equipment, error } = await supabase
      .from('golf_equipment')
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

    // Transform data to include user_name
    const transformedEquipment = equipment?.map((eq: any) => ({
      ...eq,
      user_name: eq.profiles?.display_name || eq.profiles?.email || 'Unknown',
      profiles: undefined,
    }))

    return NextResponse.json({ equipment: transformedEquipment })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/trips/[tripId]/golf/equipment - Create equipment needs
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
    const { needs_clubs, needs_cart, needs_push_cart, notes } = body

    // Create equipment needs
    const { data: equipment, error } = await supabase
      .from('golf_equipment')
      .insert({
        trip_id: tripId,
        user_id: user.id,
        needs_clubs,
        needs_cart,
        needs_push_cart,
        notes,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ equipment }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/trips/[tripId]/golf/equipment - Update equipment needs
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
    const { needs_clubs, needs_cart, needs_push_cart, notes } = body

    // Update equipment needs (for current user)
    const { data: equipment, error } = await supabase
      .from('golf_equipment')
      .update({
        needs_clubs,
        needs_cart,
        needs_push_cart,
        notes,
      })
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ equipment })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
