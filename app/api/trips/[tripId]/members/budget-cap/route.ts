import { createClient } from '@/lib/supabase/server'
import { setBudgetCapSchema } from '@/lib/validations/members'
import { NextResponse } from 'next/server'

// PATCH /api/trips/[tripId]/members/budget-cap - Set own budget cap
export async function PATCH(
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

    const body = await request.json()
    const validation = setBudgetCapSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.issues }, { status: 400 })
    }

    const { data: member, error } = await supabase
      .from('trip_members')
      .update({ budget_cap: validation.data.budget_cap })
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .select('id, budget_cap')
      .single()

    if (error) {
      console.error('Error setting budget cap:', error)
      return NextResponse.json({ error: 'Failed to set budget cap' }, { status: 500 })
    }

    return NextResponse.json({ member })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
