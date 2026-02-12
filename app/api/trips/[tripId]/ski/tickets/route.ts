import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/trips/[tripId]/ski/tickets - Get all lift tickets for a trip
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

    // Fetch tickets with user profiles
    const { data: tickets, error } = await supabase
      .from('ski_tickets')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          email
        )
      `)
      .eq('trip_id', tripId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform data
    const transformedTickets = tickets?.map((ticket: any) => ({
      ...ticket,
      user_name: ticket.profiles?.full_name || ticket.profiles?.email || 'Unknown',
      profiles: undefined,
    }))

    return NextResponse.json({ tickets: transformedTickets })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/trips/[tripId]/ski/tickets - Create lift ticket
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
    const { ticket_type, num_days, purchased, cost } = body

    // Create ticket
    const { data: ticket, error } = await supabase
      .from('ski_tickets')
      .insert({
        trip_id: tripId,
        user_id: user.id,
        ticket_type,
        num_days,
        purchased: purchased || false,
        cost,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ticket }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/trips/[tripId]/ski/tickets - Update lift ticket
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
    const { ticket_type, num_days, purchased, cost } = body

    // Update ticket (for current user)
    const { data: ticket, error } = await supabase
      .from('ski_tickets')
      .update({
        ticket_type,
        num_days,
        purchased: purchased || false,
        cost,
      })
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ticket })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
