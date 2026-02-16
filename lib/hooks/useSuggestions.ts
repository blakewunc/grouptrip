'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Suggestion {
  id: string
  trip_id: string
  title: string
  description: string | null
  date: string | null
  time: string | null
  location: string | null
  suggested_by: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  profiles: {
    id: string
    display_name: string | null
    email: string
  }
}

export function useSuggestions(tripId: string) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSuggestions = useCallback(async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}/suggestions`)
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch suggestions')
      }
      const data = await response.json()
      setSuggestions(data.suggestions)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    fetchSuggestions()
  }, [fetchSuggestions])

  // Real-time subscription
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`suggestions:${tripId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activity_suggestions',
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          fetchSuggestions()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tripId, fetchSuggestions])

  return { suggestions, loading, error, refetch: fetchSuggestions }
}
