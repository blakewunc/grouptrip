'use client'

import { use, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { TripHeader } from '@/components/trips/TripHeader'
import { TripSwitcher } from '@/components/trips/TripSwitcher'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { OverviewTab } from '@/components/trips/tabs/OverviewTab'
import { BudgetTab } from '@/components/trips/tabs/BudgetTab'
import { ItineraryTab } from '@/components/trips/tabs/ItineraryTab'
import { ExpensesTab } from '@/components/trips/tabs/ExpensesTab'
import { SuppliesTab } from '@/components/trips/tabs/SuppliesTab'
import { AccommodationTab } from '@/components/trips/tabs/AccommodationTab'
import { createClient } from '@/lib/supabase/client'
import { useTrip } from '@/lib/hooks/useTrip'
import { Suspense } from 'react'

const VALID_TABS = ['overview', 'budget', 'itinerary', 'expenses', 'supplies', 'accommodation'] as const
type TabValue = (typeof VALID_TABS)[number]

function TripDetailContent({ tripId }: { tripId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { trip, loading, error } = useTrip(tripId)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const tabParam = searchParams.get('tab') as TabValue | null
  const activeTab = tabParam && VALID_TABS.includes(tabParam) ? tabParam : 'overview'

  const handleTabChange = (value: string) => {
    const url = new URL(window.location.href)
    if (value === 'overview') {
      url.searchParams.delete('tab')
    } else {
      url.searchParams.set('tab', value)
    }
    window.history.replaceState({}, '', url.toString())
    // Force re-render by using router
    router.replace(`/trips/${tripId}${value === 'overview' ? '' : `?tab=${value}`}`, { scroll: false })
  }

  useEffect(() => {
    async function getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }
    getCurrentUser()
  }, [supabase.auth])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1ED] p-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-[#A99985]">Loading trip...</p>
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

  const isOrganizer = !!(currentUserId && trip.trip_members?.some(
    (member: any) => member.profiles.id === currentUserId && member.role === 'organizer'
  ))

  return (
    <div className="min-h-screen bg-[#F5F1ED] p-6">
      <div className="mx-auto max-w-7xl">
        {/* Trip Switcher */}
        <div className="mb-4">
          <TripSwitcher
            currentTripId={tripId}
            currentTripTitle={trip.title}
            currentTripType={trip.trip_type}
          />
        </div>

        {/* Hero Header */}
        <div className="mb-6">
          <TripHeader trip={trip} isOrganizer={isOrganizer} />
        </div>

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-2 bg-white rounded-[5px] px-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="supplies">Supplies</TabsTrigger>
            <TabsTrigger value="accommodation">Accommodation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab
              tripId={tripId}
              trip={trip}
              currentUserId={currentUserId}
              isOrganizer={isOrganizer}
            />
          </TabsContent>

          <TabsContent value="budget">
            <BudgetTab
              tripId={tripId}
              trip={trip}
              currentUserId={currentUserId}
              isOrganizer={isOrganizer}
            />
          </TabsContent>

          <TabsContent value="itinerary">
            <ItineraryTab
              tripId={tripId}
              trip={trip}
              currentUserId={currentUserId}
              isOrganizer={isOrganizer}
            />
          </TabsContent>

          <TabsContent value="expenses">
            <ExpensesTab
              tripId={tripId}
              trip={trip}
              currentUserId={currentUserId}
              isOrganizer={isOrganizer}
            />
          </TabsContent>

          <TabsContent value="supplies">
            <SuppliesTab
              tripId={tripId}
              trip={trip}
              currentUserId={currentUserId}
              isOrganizer={isOrganizer}
            />
          </TabsContent>

          <TabsContent value="accommodation">
            <AccommodationTab
              tripId={tripId}
              trip={trip}
              currentUserId={currentUserId}
              isOrganizer={isOrganizer}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function TripDetailPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params)

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F1ED] p-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-[#A99985]">Loading trip...</p>
        </div>
      </div>
    }>
      <TripDetailContent tripId={tripId} />
    </Suspense>
  )
}
