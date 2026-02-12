import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  id: string
  email: string
  display_name: string | null
}

interface BudgetSplit {
  id: string
  user_id: string
  amount: number
  profiles: Profile
}

export interface BudgetCategory {
  id: string
  name: string
  estimated_cost: number
  split_type: 'equal' | 'custom' | 'none'
  created_at: string
  budget_splits: BudgetSplit[]
}

export function useBudget(tripId: string) {
  const [categories, setCategories] = useState<BudgetCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Fetch initial budget data
    async function fetchBudget() {
      try {
        const response = await fetch(`/api/trips/${tripId}/budget`)
        if (!response.ok) {
          throw new Error('Failed to fetch budget')
        }
        const data = await response.json()
        setCategories(data.categories)
        setError(null)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchBudget()

    // Set up real-time subscription for budget_categories
    const categoriesChannel = supabase
      .channel(`trip_${tripId}_budget_categories`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'budget_categories',
          filter: `trip_id=eq.${tripId}`,
        },
        async () => {
          // Refetch budget data when categories change
          fetchBudget()
        }
      )
      .subscribe()

    // Set up real-time subscription for budget_splits
    const splitsChannel = supabase
      .channel(`trip_${tripId}_budget_splits`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'budget_splits',
        },
        async () => {
          // Refetch budget data when splits change
          fetchBudget()
        }
      )
      .subscribe()

    // Cleanup subscriptions on unmount
    return () => {
      categoriesChannel.unsubscribe()
      splitsChannel.unsubscribe()
    }
  }, [tripId, supabase])

  return { categories, loading, error, refetch: () => setLoading(true) }
}
