import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// PATCH /api/trips/:tripId/budget/:categoryId - Update a budget category
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tripId: string; categoryId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tripId, categoryId } = await params
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
        { error: 'Only organizers can update budget categories' },
        { status: 403 }
      )
    }

    // Update category
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (estimated_cost !== undefined) updateData.estimated_cost = parseFloat(estimated_cost)
    if (split_type !== undefined) {
      if (!['equal', 'custom', 'none'].includes(split_type)) {
        return NextResponse.json(
          { error: 'Invalid split_type. Must be: equal, custom, or none' },
          { status: 400 }
        )
      }
      updateData.split_type = split_type
    }

    const { data: category, error: categoryError } = await supabase
      .from('budget_categories')
      .update(updateData)
      .eq('id', categoryId)
      .eq('trip_id', tripId)
      .select()
      .single()

    if (categoryError) {
      throw categoryError
    }

    // If split_type changed to custom and custom_splits provided, update splits
    if (split_type === 'custom' && custom_splits && Array.isArray(custom_splits)) {
      // Delete existing splits
      await supabase
        .from('budget_splits')
        .delete()
        .eq('budget_category_id', categoryId)

      // Insert new splits
      const splits = custom_splits.map((split: any) => ({
        budget_category_id: categoryId,
        user_id: split.user_id,
        amount: parseFloat(split.amount),
      }))

      await supabase.from('budget_splits').insert(splits)
    }

    // If split_type changed away from custom, delete splits
    if (split_type && split_type !== 'custom') {
      await supabase
        .from('budget_splits')
        .delete()
        .eq('budget_category_id', categoryId)
    }

    return NextResponse.json({ category })
  } catch (error: any) {
    console.error('Budget update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update budget category' },
      { status: 500 }
    )
  }
}

// DELETE /api/trips/:tripId/budget/:categoryId - Delete a budget category
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tripId: string; categoryId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tripId, categoryId } = await params

    // Verify user is an organizer
    const { data: member } = await supabase
      .from('trip_members')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!member || member.role !== 'organizer') {
      return NextResponse.json(
        { error: 'Only organizers can delete budget categories' },
        { status: 403 }
      )
    }

    // Delete budget category (splits will be cascade deleted)
    const { error } = await supabase
      .from('budget_categories')
      .delete()
      .eq('id', categoryId)
      .eq('trip_id', tripId)

    if (error) {
      throw error
    }

    return NextResponse.json({ message: 'Budget category deleted successfully' })
  } catch (error: any) {
    console.error('Budget deletion error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete budget category' },
      { status: 500 }
    )
  }
}
