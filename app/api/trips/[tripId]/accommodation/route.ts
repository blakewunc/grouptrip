import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/trips/[tripId]/accommodation - Get accommodation details
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

    // Verify user is a member of the trip
    const { data: membership } = await supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch accommodation (returns null if doesn't exist yet)
    const { data: accommodation, error } = await supabase
      .from('accommodations')
      .select('*')
      .eq('trip_id', tripId)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json({ accommodation: accommodation || null })
  } catch (error: any) {
    console.error('Accommodation fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch accommodation' },
      { status: 500 }
    )
  }
}

// POST /api/trips/[tripId]/accommodation - Create or update accommodation
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

    // Verify user is organizer
    const { data: membership } = await supabase
      .from('trip_members')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!membership || membership.role !== 'organizer') {
      return NextResponse.json({ error: 'Only organizers can manage accommodation' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      address,
      check_in,
      check_out,
      door_code,
      wifi_name,
      wifi_password,
      house_rules,
      notes
    } = body

    // Upsert accommodation (insert or update)
    const { data: accommodation, error } = await supabase
      .from('accommodations')
      .upsert(
        {
          trip_id: tripId,
          name,
          address,
          check_in,
          check_out,
          door_code,
          wifi_name,
          wifi_password,
          house_rules,
          notes,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'trip_id' }
      )
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ accommodation })
  } catch (error: any) {
    console.error('Accommodation save error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save accommodation' },
      { status: 500 }
    )
  }
}
