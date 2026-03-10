import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// DELETE /api/trips/[tripId]/transportation/[transportId]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tripId: string; transportId: string }> }
) {
  try {
    const { tripId, transportId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify membership
    const { data: membership } = await supabase
      .from('trip_members')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch the entry to check ownership
    const { data: entry } = await supabase
      .from('transportation')
      .select('created_by')
      .eq('id', transportId)
      .single()

    if (!entry) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Only creator or organizer can delete
    if (entry.created_by !== user.id && membership.role !== 'organizer') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase
      .from('transportation')
      .delete()
      .eq('id', transportId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Transportation delete error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete' }, { status: 500 })
  }
}
