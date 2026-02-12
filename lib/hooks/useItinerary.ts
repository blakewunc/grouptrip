import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  id: string
  email: string
  display_name: string | null
}

export interface ItineraryItem {
  id: string
  title: string
  description: string | null
  location: string | null
  date: string
  time: string | null
  sort_order: number
  created_at: string
  created_by: string
  profiles: Profile
}

export function useItinerary(tripId: string) {
  const [items, setItems] = useState<ItineraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Fetch initial itinerary data
    async function fetchItinerary() {
      try {
        const response = await fetch(`/api/trips/${tripId}/itinerary`)
        if (!response.ok) {
          throw new Error('Failed to fetch itinerary')
        }
        const data = await response.json()
        setItems(data.items)
        setError(null)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchItinerary()

    // Set up real-time subscription for itinerary_items
    const channel = supabase
      .channel(`trip_${tripId}_itinerary`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'itinerary_items',
          filter: `trip_id=eq.${tripId}`,
        },
        async () => {
          // Refetch itinerary data when items change
          fetchItinerary()
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      channel.unsubscribe()
    }
  }, [tripId, supabase])

  return { items, loading, error, refetch: () => setLoading(true) }
}
