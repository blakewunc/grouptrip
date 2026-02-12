import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/trips/:tripId/budget - Fetch all budget categories for a trip
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

    // Fetch budget categories with custom splits
    const { data: categories, error } = await supabase
      .from('budget_categories')
      .select(`
        id,
        name,
        estimated_cost,
        split_type,
        created_at,
        budget_splits (
          id,
          user_id,
          amount,
          profiles (
            id,
            email,
            display_name
          )
        )
      `)
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({ categories: categories || [] })
  } catch (error: any) {
    console.error('Budget fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch budget' },
      { status: 500 }
    )
  }
}

// POST /api/trips/:tripId/budget - Create a new budget category
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
    const { name, estimated_cost, split_type, custom_splits } = body

    // Verify user is an organizer
    const { data: member } = await supabase
      .from('trip_members')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!member || member.role !== 'organizer') {
      return NextResponse.json(
        { error: 'Only organizers can add budget categories' },
        { status: 403 }
      )
    }

    // Validate input
    if (!name || !estimated_cost || !split_type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, estimated_cost, split_type' },
        { status: 400 }
      )
    }

    if (!['equal', 'custom', 'none'].includes(split_type)) {
      return NextResponse.json(
        { error: 'Invalid split_type. Must be: equal, custom, or none' },
        { status: 400 }
      )
    }

    // Create budget category
    const { data: category, error: categoryError } = await supabase
      .from('budget_categories')
      .insert({
        trip_id: tripId,
        name,
        estimated_cost: parseFloat(estimated_cost),
        split_type,
      })
      .select()
      .single()

    if (categoryError) {
      throw categoryError
    }

    // If custom splits provided, create them
    if (split_type === 'custom' && custom_splits && Array.isArray(custom_splits)) {
      const splits = custom_splits.map((split: any) => ({
        budget_category_id: category.id,
        user_id: split.user_id,
        amount: parseFloat(split.amount),
      }))

      const { error: splitsError } = await supabase
        .from('budget_splits')
        .insert(splits)

      if (splitsError) {
        // Rollback category creation
        await supabase.from('budget_categories').delete().eq('id', category.id)
        throw splitsError
      }
    }

    return NextResponse.json({ category }, { status: 201 })
  } catch (error: any) {
    console.error('Budget creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create budget category' },
      { status: 500 }
    )
  }
}
