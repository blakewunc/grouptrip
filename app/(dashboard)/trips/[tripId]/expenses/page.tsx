'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AddExpenseDialog } from '@/components/expenses/AddExpenseDialog'
import { ExpenseList } from '@/components/expenses/ExpenseList'
import { BalanceSheet } from '@/components/expenses/BalanceSheet'
import { useExpenses } from '@/lib/hooks/useExpenses'
import { useTrip } from '@/lib/hooks/useTrip'
import { createClient } from '@/lib/supabase/client'

export default function ExpensesPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const { trip, loading: tripLoading } = useTrip(tripId)
  const { expenses, loading: expensesLoading, error } = useExpenses(tripId)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [paymentProfiles, setPaymentProfiles] = useState<Record<string, any>>({})

  useEffect(() => {
    async function getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }
    getCurrentUser()
  }, [supabase.auth])

  // Fetch payment profiles for all members
  useEffect(() => {
    async function fetchPaymentProfiles() {
      if (!trip?.trip_members) return

      const memberIds = trip.trip_members.map(m => m.profiles.id)
      const { data } = await supabase
        .from('profiles')
        .select('id, venmo_handle, zelle_email, cashapp_handle')
        .in('id', memberIds)

      if (data) {
        const profiles = data.reduce((acc, profile) => {
          acc[profile.id] = {
            venmo_handle: profile.venmo_handle,
            zelle_email: profile.zelle_email,
            cashapp_handle: profile.cashapp_handle,
          }
          return acc
        }, {} as Record<string, any>)
        setPaymentProfiles(profiles)
      }
    }

    fetchPaymentProfiles()
  }, [trip, supabase])

  const handleDelete = async (expenseId: string) => {
    if (!confirm('Delete this expense?')) return

    try {
      const response = await fetch(`/api/trips/${tripId}/expenses/${expenseId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete expense')
      }
    } catch (error: any) {
      alert(error.message)
    }
  }

  // Prepare members list for dialogs and balance sheet
  const members = (trip?.trip_members || []).map(m => ({
    id: m.profiles.id,
    name: m.profiles.display_name || m.profiles.email,
    paymentProfile: paymentProfiles[m.profiles.id],
  }))

  if (tripLoading || expensesLoading || !currentUserId) {
    return (
      <div className="min-h-screen bg-[#F5F1ED] p-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-[#A99985]">Loading expenses...</p>
        </div>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-[#F5F1ED] p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-lg bg-red-50 p-4 text-red-800">
            {error || 'Trip not found'}
          </div>
          <Button onClick={() => router.push('/trips')} className="mt-4">
            Back to Trips
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F1ED] p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Button
              variant="outline"
              onClick={() => router.push(`/trips/${tripId}`)}
              className="mb-4"
            >
              ← Back to Trip
            </Button>
            <h1 className="text-4xl font-bold tracking-tight text-[#252323]">
              Expenses
            </h1>
            <p className="mt-2 text-[#A99985]">
              Track and settle expenses for {trip.title}
            </p>
          </div>
          <AddExpenseDialog
            tripId={tripId}
            members={members}
            currentUserId={currentUserId}
            onSuccess={() => {}}
          />
        </div>

        {/* Two-column layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Expense List */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-[#252323]">All Expenses</h2>
            <ExpenseList
              expenses={expenses}
              currentUserId={currentUserId}
              onDelete={handleDelete}
            />
          </div>

          {/* Right Column - Balance Sheet */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-[#252323]">Balances</h2>
            <BalanceSheet
              expenses={expenses}
              members={members}
              currentUserId={currentUserId}
              tripTitle={trip.title}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
