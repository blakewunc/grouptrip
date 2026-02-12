'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useBudget } from '@/lib/hooks/useBudget'
import { useTrip } from '@/lib/hooks/useTrip'
import { AddCategoryDialog } from '@/components/budget/AddCategoryDialog'
import { CategoryList } from '@/components/budget/CategoryList'
import { createClient } from '@/lib/supabase/client'

export default function BudgetPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const { categories, loading: budgetLoading, error: budgetError } = useBudget(tripId)
  const { trip, loading: tripLoading } = useTrip(tripId)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  useEffect(() => {
    async function getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }
    getCurrentUser()
  }, [supabase.auth])

  if (tripLoading || budgetLoading) {
    return (
      <div className="min-h-screen bg-[#F5F1ED] p-6">
        <div className="mx-auto max-w-4xl">
          <p className="text-[#A99985]">Loading budget...</p>
        </div>
      </div>
    )
  }

  if (budgetError || !trip) {
    return (
      <div className="min-h-screen bg-[#F5F1ED] p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg bg-red-50 p-4 text-red-800">
            {budgetError || 'Trip not found'}
          </div>
          <Button onClick={() => router.push('/trips')} className="mt-4">
            Back to Trips
          </Button>
        </div>
      </div>
    )
  }

  const isOrganizer = currentUserId && trip.trip_members?.some(
    member => member.profiles.id === currentUserId && member.role === 'organizer'
  )

  const memberCount = trip.trip_members?.length || 0

  return (
    <div className="min-h-screen bg-[#F5F1ED] p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button
              variant="outline"
              onClick={() => router.push(`/trips/${tripId}`)}
              className="mb-4"
            >
              ← Back to Trip
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Budget</h1>
            <p className="text-zinc-500">
              Plan and track expenses for {trip.title}
            </p>
          </div>
          {isOrganizer && (
            <Button onClick={() => setAddDialogOpen(true)}>
              Add Category
            </Button>
          )}
        </div>

        {/* Budget Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Categories</CardTitle>
            <CardDescription>
              {memberCount} {memberCount === 1 ? 'person' : 'people'} on this trip
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryList
              categories={categories}
              tripId={tripId}
              memberCount={memberCount}
              isOrganizer={!!isOrganizer}
              onRefresh={() => {}}
            />
          </CardContent>
        </Card>

        {/* Add Category Dialog */}
        <AddCategoryDialog
          tripId={tripId}
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onSuccess={() => {}}
        />
      </div>
    </div>
  )
}
