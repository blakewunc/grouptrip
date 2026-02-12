import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// DELETE /api/trips/[tripId]/announcements/[announcementId]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tripId: string; announcementId: string }> }
) {
  try {
    const { tripId, announcementId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('trip_announcements')
      .delete()
      .eq('id', announcementId)
      .eq('created_by', user.id)
      .eq('trip_id', tripId)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Announcement deletion error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete announcement' },
      { status: 500 }
    )
  }
}

// PATCH /api/trips/[tripId]/announcements/[announcementId] - Toggle pin
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tripId: string; announcementId: string }> }
) {
  try {
    const { tripId, announcementId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { is_pinned } = body

    const { data: announcement, error } = await supabase
      .from('trip_announcements')
      .update({ is_pinned, updated_at: new Date().toISOString() })
      .eq('id', announcementId)
      .eq('created_by', user.id)
      .eq('trip_id', tripId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ announcement })
  } catch (error: any) {
    console.error('Announcement update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update announcement' },
      { status: 500 }
    )
  }
}
