import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// PATCH /api/trips/[tripId]/supplies/[supplyId] - Update supply item (claim, update status, etc.)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tripId: string; supplyId: string }> }
) {
  try {
    const { tripId, supplyId } = await params
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
    const updates: any = {}

    // Allow updating these fields
    if ('status' in body) updates.status = body.status
    if ('claimed_by' in body) updates.claimed_by = body.claimed_by
    if ('name' in body) updates.name = body.name
    if ('description' in body) updates.description = body.description
    if ('category' in body) updates.category = body.category
    if ('quantity' in body) updates.quantity = body.quantity
    if ('cost' in body) updates.cost = body.cost

    updates.updated_at = new Date().toISOString()

    const { data: supply, error } = await supabase
      .from('supply_items')
      .update(updates)
      .eq('id', supplyId)
      .eq('trip_id', tripId)
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
    console.error('Supply update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update supply item' },
      { status: 500 }
    )
  }
}

// DELETE /api/trips/[tripId]/supplies/[supplyId] - Delete supply item
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tripId: string; supplyId: string }> }
) {
  try {
    const { tripId, supplyId } = await params
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

    const { error } = await supabase
      .from('supply_items')
      .delete()
      .eq('id', supplyId)
      .eq('trip_id', tripId)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Supply deletion error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete supply item' },
      { status: 500 }
    )
  }
}
