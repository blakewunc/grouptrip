import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/trips/[tripId]/ski/abilities - Get all ability levels for a trip
export async function GET(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a trip member
    const { data: membership } = await supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch abilities with user profiles
    const { data: abilities, error } = await supabase
      .from('ski_abilities')
      .select(`
        *,
        profiles:user_id (
          id,
          display_name,
          email
        )
      `)
      .eq('trip_id', tripId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform data
    const transformedAbilities = abilities?.map((ability: any) => ({
      ...ability,
      user_name: ability.profiles?.display_name || ability.profiles?.email || 'Unknown',
      profiles: undefined,
    }))

    return NextResponse.json({ abilities: transformedAbilities })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/trips/[tripId]/ski/abilities - Create ability level
export async function POST(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a trip member
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
    const { ability_level, ski_or_snowboard } = body

    // Create ability
    const { data: ability, error } = await supabase
      .from('ski_abilities')
      .insert({
        trip_id: tripId,
        user_id: user.id,
        ability_level,
        ski_or_snowboard,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ability }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/trips/[tripId]/ski/abilities - Update ability level
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ability_level, ski_or_snowboard } = body

    // Update ability (for current user)
    const { data: ability, error } = await supabase
      .from('ski_abilities')
      .update({
        ability_level,
        ski_or_snowboard,
      })
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ability })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
