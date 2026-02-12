import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// PATCH /api/trips/:tripId/itinerary/:itemId - Update an itinerary item
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tripId: string; itemId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tripId, itemId } = await params
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
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Update itinerary item
    const { data: item, error } = await supabase
      .from('itinerary_items')
      .update({
        title,
        description,
        location,
        date,
        time,
      })
      .eq('id', itemId)
      .eq('trip_id', tripId)
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

    if (error) {
      throw error
    }

    return NextResponse.json({ item })
  } catch (error: any) {
    console.error('Itinerary update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update itinerary item' },
      { status: 500 }
    )
  }
}

// DELETE /api/trips/:tripId/itinerary/:itemId - Delete an itinerary item
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tripId: string; itemId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tripId, itemId } = await params

    // Verify user is a member of this trip
    const { data: member } = await supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Delete itinerary item
    const { error } = await supabase
      .from('itinerary_items')
      .delete()
      .eq('id', itemId)
      .eq('trip_id', tripId)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Itinerary deletion error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete itinerary item' },
      { status: 500 }
    )
  }
}
