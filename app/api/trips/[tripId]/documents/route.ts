import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/trips/[tripId]/documents - Get all documents/links
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

    const { data: documents, error } = await supabase
      .from('trip_documents')
      .select(`
        *,
        created_by_profile:profiles!trip_documents_created_by_fkey(id, display_name, email)
      `)
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ documents: documents || [] })
  } catch (error: any) {
    console.error('Documents fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

// POST /api/trips/[tripId]/documents - Create a new document/link
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
    const { title, url, description, category } = body

    if (!title || !url) {
      return NextResponse.json(
        { error: 'Title and URL are required' },
        { status: 400 }
      )
    }

    const { data: document, error } = await supabase
      .from('trip_documents')
      .insert({
        trip_id: tripId,
        title,
        url,
        description: description || null,
        category: category || 'other',
        created_by: user.id
      })
      .select(`
        *,
        created_by_profile:profiles!trip_documents_created_by_fkey(id, display_name, email)
      `)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ document })
  } catch (error: any) {
    console.error('Document creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create document' },
      { status: 500 }
    )
  }
}
