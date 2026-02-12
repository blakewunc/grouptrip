import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/trips/[tripId]/golf/scores - Get all scores for a trip
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

    // Fetch scores with user profiles and tee time details
    const { data: scores, error } = await supabase
      .from('golf_scores')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          email
        ),
        golf_tee_times:tee_time_id (
          id,
          course_name,
          tee_time,
          trip_id
        )
      `)
      .eq('golf_tee_times.trip_id', tripId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform data
    const transformedScores = scores?.map((score: any) => ({
      user_id: score.user_id,
      user_name: score.profiles?.full_name || score.profiles?.email || 'Unknown',
      score: score.score,
      handicap: score.handicap,
      tee_time_id: score.tee_time_id,
      course_name: score.golf_tee_times?.course_name || 'Unknown Course',
    }))

    return NextResponse.json({ scores: transformedScores })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
