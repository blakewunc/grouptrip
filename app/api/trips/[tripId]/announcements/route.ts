import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/trips/[tripId]/announcements
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

    const { data: announcements, error } = await supabase
      .from('trip_announcements')
      .select(`
        *,
        created_by_profile:profiles!trip_announcements_created_by_fkey(id, display_name, email)
      `)
      .eq('trip_id', tripId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ announcements: announcements || [] })
  } catch (error: any) {
    console.error('Announcements fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch announcements' },
      { status: 500 }
    )
  }
}

// POST /api/trips/[tripId]/announcements
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
      return NextResponse.json({ error: 'Only organizers can post announcements' }, { status: 403 })
    }

    const body = await request.json()
    const { title, content, is_pinned } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const { data: announcement, error } = await supabase
      .from('trip_announcements')
      .insert({
        trip_id: tripId,
        title,
        content,
        is_pinned: is_pinned || false,
        created_by: user.id
      })
      .select(`
        *,
        created_by_profile:profiles!trip_announcements_created_by_fkey(id, display_name, email)
      `)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ announcement })
  } catch (error: any) {
    console.error('Announcement creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create announcement' },
      { status: 500 }
    )
  }
}
