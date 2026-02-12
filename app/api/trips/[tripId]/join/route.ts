import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/trips/[tripId]/join - Join a trip
export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tripId } = await params
    const body = await request.json()
    const { rsvp_status = 'accepted' } = body

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('trip_members')
      .select('id, rsvp_status')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      // Update RSVP status if already a member
      const { error: updateError } = await supabase
        .from('trip_members')
        .update({ rsvp_status })
        .eq('trip_id', tripId)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating membership:', updateError)
        return NextResponse.json({ error: 'Failed to update membership' }, { status: 500 })
      }

      return NextResponse.json({ message: 'RSVP updated successfully' })
    }

    // Add user as a new member
    const { error: insertError } = await supabase.from('trip_members').insert({
      trip_id: tripId,
      user_id: user.id,
      role: 'member',
      rsvp_status,
    })

    if (insertError) {
      console.error('Error joining trip:', insertError)
      return NextResponse.json({ error: 'Failed to join trip' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Successfully joined trip' }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
