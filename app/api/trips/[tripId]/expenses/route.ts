import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/trips/:tripId/expenses - Fetch all expenses for a trip
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

    // Fetch expenses with payer info and splits
    const { data: expenses, error } = await supabase
      .from('shared_expenses')
      .select(`
        id,
        description,
        amount,
        category,
        date,
        paid_by,
        created_at,
        profiles!shared_expenses_paid_by_fkey (
          id,
          email,
          display_name
        ),
        expense_splits (
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
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ expenses: expenses || [] })
  } catch (error: any) {
    console.error('Expenses fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch expenses' },
      { status: 500 }
    )
  }
}

// POST /api/trips/:tripId/expenses - Create a new expense
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
    const { description, amount, category, date, paid_by, split_type, custom_splits } = body

    // Verify user is a member of this trip
    const { data: member } = await supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return NextResponse.json(
        { error: 'Not authorized to add expenses to this trip' },
        { status: 403 }
      )
    }

    // Validate input
    if (!description || !amount || !paid_by) {
      return NextResponse.json(
        { error: 'Missing required fields: description, amount, paid_by' },
        { status: 400 }
      )
    }

    if (!['equal', 'custom'].includes(split_type)) {
      return NextResponse.json(
        { error: 'Invalid split_type. Must be: equal or custom' },
        { status: 400 }
      )
    }

    // Create expense
    const { data: expense, error: expenseError } = await supabase
      .from('shared_expenses')
      .insert({
        trip_id: tripId,
        paid_by,
        description,
        amount: parseFloat(amount),
        category,
        date: date || new Date().toISOString().split('T')[0],
      })
      .select()
      .single()

    if (expenseError) {
      throw expenseError
    }

    // Create splits
    let splits: Array<{ expense_id: string; user_id: string; amount: number }> = []
    if (split_type === 'equal') {
      // Get all trip members for equal split
      const { data: members } = await supabase
        .from('trip_members')
        .select('user_id')
        .eq('trip_id', tripId)

      if (members && members.length > 0) {
        const splitAmount = parseFloat(amount) / members.length
        splits = members.map((m) => ({
          expense_id: expense.id,
          user_id: m.user_id,
          amount: Math.round(splitAmount * 100) / 100, // Round to 2 decimals
        }))
      }
    } else if (split_type === 'custom' && custom_splits && Array.isArray(custom_splits)) {
      splits = custom_splits.map((split: any) => ({
        expense_id: expense.id,
        user_id: split.user_id,
        amount: parseFloat(split.amount),
      }))
    }

    if (splits.length > 0) {
      const { error: splitsError } = await supabase
        .from('expense_splits')
        .insert(splits)

      if (splitsError) {
        // Rollback expense creation
        await supabase.from('shared_expenses').delete().eq('id', expense.id)
        throw splitsError
      }
    }

    // Fetch the created expense with all relations
    const { data: createdExpense } = await supabase
      .from('shared_expenses')
      .select(`
        id,
        description,
        amount,
        category,
        date,
        paid_by,
        created_at,
        profiles!shared_expenses_paid_by_fkey (
          id,
          email,
          display_name
        ),
        expense_splits (
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
      .eq('id', expense.id)
      .single()

    return NextResponse.json({ expense: createdExpense }, { status: 201 })
  } catch (error: any) {
    console.error('Expense creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create expense' },
      { status: 500 }
    )
  }
}
