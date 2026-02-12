import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/trips/:tripId/comments - Fetch all comments for a trip's itinerary
export async function GET(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tripId } = await params
    const { searchParams } = new URL(request.url)
    const itineraryItemId = searchParams.get('itinerary_item_id')

    // Verify user is a member of this trip
    const { data: member } = await supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Not authorized to view this trip' }, { status: 403 })
    }

    // Build query - comments are associated with itinerary items
    let query = supabase
      .from('comments')
      .select(`
        id,
        text,
        itinerary_item_id,
        created_at,
        user_id,
        profiles (
          id,
          email,
          display_name
        )
      `)
      .order('created_at', { ascending: true })

    // Filter by itinerary item if specified
    if (itineraryItemId) {
      query = query.eq('itinerary_item_id', itineraryItemId)
    }

    const { data: comments, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ comments: comments || [] })
  } catch (error: any) {
    console.error('Comments fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST /api/trips/:tripId/comments - Create a new comment
export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tripId } = await params
    const body = await request.json()
    const { text, itinerary_item_id } = body

    // Verify user is a member of this trip
    const { data: member } = await supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json(
        { error: 'Not authorized to comment on this trip' },
        { status: 403 }
      )
    }

    // Validate input
    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'Comment text is required' },
        { status: 400 }
      )
    }

    if (!itinerary_item_id) {
      return NextResponse.json(
        { error: 'itinerary_item_id is required' },
        { status: 400 }
      )
    }

    // Create comment
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert({
        itinerary_item_id,
        user_id: user.id,
        text: text.trim(),
      })
      .select(`
        id,
        text,
        itinerary_item_id,
        created_at,
        user_id,
        profiles (
          id,
          email,
          display_name
        )
      `)
      .single()

    if (commentError) {
      throw commentError
    }

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error: any) {
    console.error('Comment creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create comment' },
      { status: 500 }
    )
  }
}

// DELETE /api/trips/:tripId/comments/:commentId - Delete a comment
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tripId } = await params
    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('comment_id')

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 })
    }

    // Verify user owns this comment
    const { data: comment } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .eq('trip_id', tripId)
      .single()

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    if (comment.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 }
      )
    }

    // Delete comment
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Comment deletion error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete comment' },
      { status: 500 }
    )
  }
}
