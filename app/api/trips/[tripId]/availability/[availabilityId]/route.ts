import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// DELETE /api/trips/[tripId]/availability/[availabilityId]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tripId: string; availabilityId: string }> }
) {
  try {
    const { tripId, availabilityId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete (RLS ensures user can only delete their own)
    const { error } = await supabase
      .from('user_availability')
      .delete()
      .eq('id', availabilityId)
      .eq('user_id', user.id)
      .eq('trip_id', tripId)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Availability deletion error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete availability' },
      { status: 500 }
    )
  }
}
