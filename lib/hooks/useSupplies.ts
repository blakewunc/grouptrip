'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface SupplyItem {
  id: string
  trip_id: string
  name: string
  description: string | null
  category: 'food_drinks' | 'gear_equipment' | 'kitchen_cooking' | 'entertainment' | 'toiletries' | 'other'
  quantity: number
  status: 'needed' | 'claimed' | 'packed'
  cost: number | null
  claimed_by: string | null
  created_by: string
  created_at: string
  updated_at: string
  claimed_by_profile?: {
    id: string
    display_name: string | null
    email: string
  } | null
  created_by_profile?: {
    id: string
    display_name: string | null
    email: string
  }
}

export function useSupplies(tripId: string) {
  const [supplies, setSupplies] = useState<SupplyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSupplies()
    setupRealtimeSubscription()
  }, [tripId])

  async function fetchSupplies() {
    try {
      setLoading(true)
      const response = await fetch(`/api/trips/${tripId}/supplies`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch supplies')
      }

      const data = await response.json()
      setSupplies(data.supplies || [])
      setError(null)
    } catch (err: any) {
      console.error('Error fetching supplies:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function setupRealtimeSubscription() {
    const supabase = createClient()

    const channel = supabase
      .channel(`supply_items:trip_id=eq.${tripId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'supply_items',
          filter: `trip_id=eq.${tripId}`
        },
        () => {
          fetchSupplies()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }

  return { supplies, loading, error, refetch: fetchSupplies }
}
