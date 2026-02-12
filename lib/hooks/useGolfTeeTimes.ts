import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface TeeTime {
  id: string
  trip_id: string
  course_name: string
  course_location: string | null
  tee_time: string
  num_players: number
  players: string[] | null
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export function useGolfTeeTimes(tripId: string) {
  const [teeTimes, setTeeTimes] = useState<TeeTime[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Fetch initial tee times
    async function fetchTeeTimes() {
      try {
        const response = await fetch(`/api/trips/${tripId}/golf/tee-times`)
        if (!response.ok) {
          throw new Error('Failed to fetch tee times')
        }
        const data = await response.json()
        setTeeTimes(data.teeTimes || [])
        setError(null)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTeeTimes()

    // Set up real-time subscription
    const channel = supabase
      .channel(`golf_tee_times_${tripId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'golf_tee_times',
          filter: `trip_id=eq.${tripId}`,
        },
        async () => {
          // Refetch tee times when they change
          fetchTeeTimes()
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      channel.unsubscribe()
    }
  }, [tripId, supabase])

  return { teeTimes, loading, error }
}
