import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/profile/payment - Get current user's payment profile
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch payment profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('venmo_handle, zelle_email, cashapp_handle')
      .eq('id', user.id)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ profile: profile || {} })
  } catch (error: any) {
    console.error('Payment profile fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payment profile' },
      { status: 500 }
    )
  }
}

// POST /api/profile/payment - Update current user's payment profile
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { venmo_handle, zelle_email, cashapp_handle } = body

    // Update payment profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        venmo_handle: venmo_handle || null,
        zelle_email: zelle_email || null,
        cashapp_handle: cashapp_handle || null,
      })
      .eq('id', user.id)
      .select('venmo_handle, zelle_email, cashapp_handle')
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ profile })
  } catch (error: any) {
    console.error('Payment profile update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update payment profile' },
      { status: 500 }
    )
  }
}
