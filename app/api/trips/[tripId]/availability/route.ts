import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/trips/[tripId]/availability - Get all availability for trip
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

    // Verify user is a member
    const { data: membership } = await supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all availability
    const { data: availability, error } = await supabase
      .from('user_availability')
      .select(`
        *,
        user:profiles!user_availability_user_id_fkey(id, display_name, email)
      `)
      .eq('trip_id', tripId)
      .order('start_date', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({ availability: availability || [] })
  } catch (error: any) {
    console.error('Availability fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}

// POST /api/trips/[tripId]/availability - Add availability
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

    // Verify user is a member
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
    const { start_date, end_date, notes } = body

    if (!start_date || !end_date) {
      return NextResponse.json(
        { error: 'Start and end dates are required' },
        { status: 400 }
      )
    }

    const { data: availability, error } = await supabase
      .from('user_availability')
      .insert({
        trip_id: tripId,
        user_id: user.id,
        start_date,
        end_date,
        notes: notes || null
      })
      .select(`
        *,
        user:profiles!user_availability_user_id_fkey(id, display_name, email)
      `)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ availability })
  } catch (error: any) {
    console.error('Availability creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to add availability' },
      { status: 500 }
    )
  }
}
