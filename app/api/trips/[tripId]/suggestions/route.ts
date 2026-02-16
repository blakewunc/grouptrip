import { createClient } from '@/lib/supabase/server'
import { createSuggestionSchema } from '@/lib/validations/suggestion'
import { NextResponse } from 'next/server'

// GET /api/trips/[tripId]/suggestions - List suggestions
export async function GET(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tripId } = await params

    // Verify membership
    const { data: membership } = await supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Not a trip member' }, { status: 403 })
    }

    const { data: suggestions, error } = await supabase
      .from('activity_suggestions')
      .select('*, profiles:suggested_by(id, display_name, email)')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching suggestions:', error)
      return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 })
    }

    return NextResponse.json({ suggestions: suggestions || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/trips/[tripId]/suggestions - Create suggestion
export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tripId } = await params

    // Verify membership
    const { data: membership } = await supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Not a trip member' }, { status: 403 })
    }

    const body = await request.json()
    const validation = createSuggestionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.issues }, { status: 400 })
    }

    const { data: suggestion, error } = await supabase
      .from('activity_suggestions')
      .insert({
        trip_id: tripId,
        suggested_by: user.id,
        ...validation.data,
      })
      .select('*, profiles:suggested_by(id, display_name, email)')
      .single()

    if (error) {
      console.error('Error creating suggestion:', error)
      return NextResponse.json({ error: 'Failed to create suggestion' }, { status: 500 })
    }

    return NextResponse.json({ suggestion }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
