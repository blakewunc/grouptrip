'use client'

import { use, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { TripHeroHeader } from '@/components/trips/TripHeroHeader'
import { TripSwitcher } from '@/components/trips/TripSwitcher'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { OverviewTab } from '@/components/trips/tabs/OverviewTab'
import { BudgetTab } from '@/components/trips/tabs/BudgetTab'
import { ItineraryTab } from '@/components/trips/tabs/ItineraryTab'
import { ExpensesTab } from '@/components/trips/tabs/ExpensesTab'
import { SuppliesTab } from '@/components/trips/tabs/SuppliesTab'
import { AccommodationTab } from '@/components/trips/tabs/AccommodationTab'
import { AIAssistantPanel } from '@/components/trips/AIAssistantPanel'
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
  const [aiPanelOpen, setAiPanelOpen] = useState(false)

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
        <div className="mx-auto max-w-[1400px]">
          <p className="text-[#A99985]">Loading trip...</p>
        </div>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-[#F5F1ED] p-6">
        <div className="mx-auto max-w-[1400px]">
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
    <div className="min-h-screen bg-[#F5F1ED]">
      <div className="mx-auto max-w-[1400px] px-6 py-6">
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
          <TripHeroHeader trip={trip} isOrganizer={isOrganizer} />
        </div>

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-6 bg-white rounded-[8px] px-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
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
              onSwitchTab={handleTabChange}
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

      {/* Floating Action Buttons */}
      {!aiPanelOpen && (
        <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-3">
          <button
            onClick={() => setAiPanelOpen(true)}
            className="flex items-center gap-2 rounded-full bg-[#70798C] px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(112,121,140,0.4)] transition-all hover:bg-[#5A6270] hover:shadow-[0_6px_16px_rgba(112,121,140,0.5)]"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
            AI Planner
          </button>
          <button
            onClick={() => handleTabChange('itinerary')}
            className="flex items-center gap-2 rounded-full bg-[#4A7C59] px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(74,124,89,0.4)] transition-all hover:bg-[#3d6a4a] hover:shadow-[0_6px_16px_rgba(74,124,89,0.5)]"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Activity
          </button>
        </div>
      )}

      {/* AI Assistant Panel */}
      <AIAssistantPanel
        tripId={tripId}
        tripTitle={trip.title}
        tripDestination={trip.destination}
        tripType={trip.trip_type}
        open={aiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
      />
    </div>
  )
}

export default function TripDetailPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params)

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F1ED] p-6">
        <div className="mx-auto max-w-[1400px]">
          <p className="text-[#A99985]">Loading trip...</p>
        </div>
      </div>
    }>
      <TripDetailContent tripId={tripId} />
    </Suspense>
  )
}
