import { createClient } from '@/lib/supabase/server'
import { updateMemberSchema } from '@/lib/validations/members'
import { NextResponse } from 'next/server'

// PATCH /api/trips/[tripId]/members/[memberId] - Update member role or budget_cap
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tripId: string; memberId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tripId, memberId } = await params

    // Verify user is organizer
    const { data: currentMembership } = await supabase
      .from('trip_members')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!currentMembership || currentMembership.role !== 'organizer') {
      return NextResponse.json({ error: 'Only organizers can update members' }, { status: 403 })
    }

    const body = await request.json()
    const validation = updateMemberSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.issues }, { status: 400 })
    }

    // If demoting, check this isn't the sole organizer
    if (validation.data.role === 'member') {
      const { data: targetMember } = await supabase
        .from('trip_members')
        .select('user_id, role')
        .eq('id', memberId)
        .single()

      if (targetMember?.role === 'organizer') {
        const { count } = await supabase
          .from('trip_members')
          .select('id', { count: 'exact', head: true })
          .eq('trip_id', tripId)
          .eq('role', 'organizer')

        if ((count || 0) <= 1) {
          return NextResponse.json({ error: 'Cannot demote the only organizer' }, { status: 400 })
        }
      }
    }

    const { data: member, error } = await supabase
      .from('trip_members')
      .update(validation.data)
      .eq('id', memberId)
      .eq('trip_id', tripId)
      .select('id, role, rsvp_status, budget_cap, joined_at, profiles(id, display_name, email, avatar_url)')
      .single()

    if (error) {
      console.error('Error updating member:', error)
      return NextResponse.json({ error: 'Failed to update member' }, { status: 500 })
    }

    return NextResponse.json({ member })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/trips/[tripId]/members/[memberId] - Remove member
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tripId: string; memberId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tripId, memberId } = await params

    // Verify user is organizer
    const { data: currentMembership } = await supabase
      .from('trip_members')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!currentMembership || currentMembership.role !== 'organizer') {
      return NextResponse.json({ error: 'Only organizers can remove members' }, { status: 403 })
    }

    // Prevent removing self if sole organizer
    const { data: targetMember } = await supabase
      .from('trip_members')
      .select('user_id, role')
      .eq('id', memberId)
      .single()

    if (targetMember?.user_id === user.id) {
      const { count } = await supabase
        .from('trip_members')
        .select('id', { count: 'exact', head: true })
        .eq('trip_id', tripId)
        .eq('role', 'organizer')

      if ((count || 0) <= 1) {
        return NextResponse.json({ error: 'Cannot remove yourself as the only organizer' }, { status: 400 })
      }
    }

    const { error } = await supabase
      .from('trip_members')
      .delete()
      .eq('id', memberId)
      .eq('trip_id', tripId)

    if (error) {
      console.error('Error removing member:', error)
      return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
