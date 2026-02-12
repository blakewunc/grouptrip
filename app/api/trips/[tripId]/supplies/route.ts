import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/trips/[tripId]/supplies - Get all supply items for a trip
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

    // Verify user is a member of the trip
    const { data: membership } = await supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch supply items with claimed_by user info
    const { data: supplies, error } = await supabase
      .from('supply_items')
      .select(`
        *,
        claimed_by_profile:profiles!supply_items_claimed_by_fkey(id, display_name, email),
        created_by_profile:profiles!supply_items_created_by_fkey(id, display_name, email)
      `)
      .eq('trip_id', tripId)
      .order('category', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({ supplies: supplies || [] })
  } catch (error: any) {
    console.error('Supplies fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch supplies' },
      { status: 500 }
    )
  }
}

// POST /api/trips/[tripId]/supplies - Create a new supply item
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

    // Verify user is a member of the trip
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
    const { name, description, category, quantity, cost } = body

    // Validate required fields
    if (!name || !category) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      )
    }

    // Create supply item
    const { data: supply, error } = await supabase
      .from('supply_items')
      .insert({
        trip_id: tripId,
        name,
        description: description || null,
        category,
        quantity: quantity || 1,
        cost: cost || null,
        created_by: user.id,
        status: 'needed'
      })
      .select(`
        *,
        claimed_by_profile:profiles!supply_items_claimed_by_fkey(id, display_name, email),
        created_by_profile:profiles!supply_items_created_by_fkey(id, display_name, email)
      `)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ supply })
  } catch (error: any) {
    console.error('Supply creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create supply item' },
      { status: 500 }
    )
  }
}
