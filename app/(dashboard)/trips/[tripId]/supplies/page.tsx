'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AddSupplyDialog } from '@/components/supplies/AddSupplyDialog'
import { SupplyList } from '@/components/supplies/SupplyList'
import { useSupplies } from '@/lib/hooks/useSupplies'
import { useTrip } from '@/lib/hooks/useTrip'
import { createClient } from '@/lib/supabase/client'

export default function SuppliesPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const { trip, loading: tripLoading } = useTrip(tripId)
  const { supplies, loading: suppliesLoading, error } = useSupplies(tripId)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    async function getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }
    getCurrentUser()
  }, [supabase.auth])

  const handleClaim = async (supplyId: string, claim: boolean) => {
    try {
      const response = await fetch(`/api/trips/${tripId}/supplies/${supplyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimed_by: claim ? currentUserId : null,
          status: claim ? 'claimed' : 'needed',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to claim item')
      }
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleToggleStatus = async (supplyId: string, newStatus: 'needed' | 'claimed' | 'packed') => {
    try {
      const response = await fetch(`/api/trips/${tripId}/supplies/${supplyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update status')
      }
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleDelete = async (supplyId: string) => {
    if (!confirm('Delete this item?')) return

    try {
      const response = await fetch(`/api/trips/${tripId}/supplies/${supplyId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete item')
      }
    } catch (error: any) {
      alert(error.message)
    }
  }

  // Calculate stats
  const totalItems = supplies.length
  const claimedItems = supplies.filter(s => s.status === 'claimed' || s.status === 'packed').length
  const packedItems = supplies.filter(s => s.status === 'packed').length
  const totalCost = supplies.reduce((sum, s) => sum + (s.cost || 0), 0)

  if (tripLoading || suppliesLoading || !currentUserId) {
    return (
      <div className="min-h-screen bg-[#F5F1ED] p-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-[#A99985]">Loading supplies...</p>
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
              Supplies & Packing
            </h1>
            <p className="mt-2 text-[#A99985]">
              Shared packing list for {trip.title}
            </p>
          </div>
          <AddSupplyDialog tripId={tripId} onSuccess={() => {}} />
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Items</CardDescription>
              <CardTitle className="text-3xl">{totalItems}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Claimed</CardDescription>
              <CardTitle className="text-3xl">{claimedItems}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Packed</CardDescription>
              <CardTitle className="text-3xl text-green-600">{packedItems}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Cost</CardDescription>
              <CardTitle className="text-3xl">${totalCost.toFixed(2)}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Supply List */}
        <SupplyList
          supplies={supplies}
          currentUserId={currentUserId}
          tripId={tripId}
          onClaim={handleClaim}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}
