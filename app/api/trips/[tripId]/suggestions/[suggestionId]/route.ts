import { createClient } from '@/lib/supabase/server'
import { updateSuggestionStatusSchema } from '@/lib/validations/suggestion'
import { NextResponse } from 'next/server'

// PATCH /api/trips/[tripId]/suggestions/[suggestionId] - Approve/reject or edit
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tripId: string; suggestionId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tripId, suggestionId } = await params
    const body = await request.json()

    // Check if this is a status update (approve/reject)
    const statusValidation = updateSuggestionStatusSchema.safeParse(body)

    if (statusValidation.success) {
      // Verify organizer for status changes
      const { data: membership } = await supabase
        .from('trip_members')
        .select('role')
        .eq('trip_id', tripId)
        .eq('user_id', user.id)
        .single()

      if (!membership || membership.role !== 'organizer') {
        return NextResponse.json({ error: 'Only organizers can approve/reject' }, { status: 403 })
      }

      const { status } = statusValidation.data

      // If approving, copy to itinerary_items
      if (status === 'approved') {
        const { data: suggestion } = await supabase
          .from('activity_suggestions')
          .select('*')
          .eq('id', suggestionId)
          .single()

        if (suggestion) {
          await supabase.from('itinerary_items').insert({
            trip_id: tripId,
            title: suggestion.title,
            description: suggestion.description,
            date: suggestion.date,
            time: suggestion.time,
            location: suggestion.location,
            created_by: suggestion.suggested_by,
          })
        }
      }

      const { data: updated, error } = await supabase
        .from('activity_suggestions')
        .update({ status })
        .eq('id', suggestionId)
        .eq('trip_id', tripId)
        .select('*, profiles:suggested_by(id, display_name, email)')
        .single()

      if (error) {
        console.error('Error updating suggestion:', error)
        return NextResponse.json({ error: 'Failed to update suggestion' }, { status: 500 })
      }

      return NextResponse.json({ suggestion: updated })
    }

    // Otherwise it's an edit by the creator - RLS handles permission
    const { data: updated, error } = await supabase
      .from('activity_suggestions')
      .update(body)
      .eq('id', suggestionId)
      .eq('trip_id', tripId)
      .eq('suggested_by', user.id)
      .select('*, profiles:suggested_by(id, display_name, email)')
      .single()

    if (error) {
      console.error('Error editing suggestion:', error)
      return NextResponse.json({ error: 'Failed to edit suggestion' }, { status: 500 })
    }

    return NextResponse.json({ suggestion: updated })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/trips/[tripId]/suggestions/[suggestionId]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tripId: string; suggestionId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tripId, suggestionId } = await params

    // Check if organizer or creator
    const { data: membership } = await supabase
      .from('trip_members')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Not a trip member' }, { status: 403 })
    }

    // Try to delete - RLS will handle permissions (creator or organizer)
    let query = supabase
      .from('activity_suggestions')
      .delete()
      .eq('id', suggestionId)
      .eq('trip_id', tripId)

    // If not organizer, restrict to own suggestions
    if (membership.role !== 'organizer') {
      query = query.eq('suggested_by', user.id)
    }

    const { error } = await query

    if (error) {
      console.error('Error deleting suggestion:', error)
      return NextResponse.json({ error: 'Failed to delete suggestion' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
