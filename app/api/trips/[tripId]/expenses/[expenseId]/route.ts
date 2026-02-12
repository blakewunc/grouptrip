import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// DELETE /api/trips/:tripId/expenses/:expenseId - Delete an expense
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tripId: string; expenseId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tripId, expenseId } = await params

    // Verify user is a member of this trip
    const { data: member } = await supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Delete expense (splits will be cascade deleted)
    const { error } = await supabase
      .from('shared_expenses')
      .delete()
      .eq('id', expenseId)
      .eq('trip_id', tripId)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Expense deletion error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete expense' },
      { status: 500 }
    )
  }
}
