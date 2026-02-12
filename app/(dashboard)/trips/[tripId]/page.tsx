'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MemberList } from '@/components/trips/MemberList'
import { TripHeader } from '@/components/trips/TripHeader'
import { RsvpStatus } from '@/components/trips/RsvpStatus'
import { createClient } from '@/lib/supabase/client'
import { useTrip } from '@/lib/hooks/useTrip'

export default function TripDetailPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const { trip, loading, error } = useTrip(tripId)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

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
        <div className="mx-auto max-w-4xl">
          <p className="text-[#A99985]">Loading trip...</p>
        </div>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-[#F5F1ED] p-6">
        <div className="mx-auto max-w-4xl">
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

  const isOrganizer = currentUserId && trip.trip_members?.some(
    member => member.profiles.id === currentUserId && member.role === 'organizer'
  )

  const currentMember = trip.trip_members?.find(
    member => member.profiles.id === currentUserId
  )

  return (
    <div className="min-h-screen bg-[#F5F1ED] p-6">
      <div className="mx-auto max-w-7xl">
        {/* Hero Header */}
        <div className="mb-8">
          <TripHeader trip={trip} isOrganizer={!!isOrganizer} />
        </div>

        {/* Description (if exists) - Full width */}
        {trip.description && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>About this trip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed text-[#A99985]">{trip.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Two-column grid layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            {/* RSVP Status */}
            {currentMember && (
              <RsvpStatus
                tripId={trip.id}
                currentStatus={currentMember.rsvp_status}
                onUpdate={() => {}}
              />
            )}

            {/* Golf Module - Conditional */}
            {trip.trip_type === 'golf' && (
              <Card className="border-[#70798C]">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2 text-2xl">⛳</span>
                    Golf Module
                  </CardTitle>
                  <CardDescription>Tee times, scorecards, and equipment</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-[#A99985]">
                    Schedule rounds, track scores, coordinate equipment rentals, and view the leaderboard.
                  </p>
                  <Button onClick={() => router.push(`/trips/${tripId}/golf`)} className="w-full">
                    Manage Golf Details
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Ski Module - Conditional */}
            {trip.trip_type === 'ski' && (
              <Card className="border-[#70798C]">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2 text-2xl">⛷️</span>
                    Ski Module
                  </CardTitle>
                  <CardDescription>Lift tickets, abilities, and rentals</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-[#A99985]">
                    Coordinate lift tickets, track ability levels, and manage equipment rentals.
                  </p>
                  <Button onClick={() => router.push(`/trips/${tripId}/ski`)} className="w-full">
                    Manage Ski Details
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Budget Card */}
            <Card>
              <CardHeader>
                <CardTitle>Budget & Expenses</CardTitle>
                <CardDescription>Plan costs and split expenses</CardDescription>
              </CardHeader>
              <CardContent>
                {trip.budget_total ? (
                  <div className="mb-4">
                    <p className="text-3xl font-bold text-[#252323]">${trip.budget_total.toLocaleString()}</p>
                    <p className="mt-1 text-sm text-[#A99985]">Total estimated budget</p>
                  </div>
                ) : (
                  <p className="mb-4 text-sm text-[#A99985]">
                    Create budget categories, split costs, and keep everyone on the same page.
                  </p>
                )}
                <Button onClick={() => router.push(`/trips/${tripId}/budget`)} className="w-full">
                  {trip.budget_total ? 'Manage Budget' : 'Set Up Budget'}
                </Button>
              </CardContent>
            </Card>

            {/* Itinerary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Itinerary</CardTitle>
                <CardDescription>Day-by-day schedule with comments</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-[#A99985]">
                  Plan activities for each day and collaborate with comments.
                </p>
                <Button onClick={() => router.push(`/trips/${tripId}/itinerary`)} className="w-full">
                  View Itinerary
                </Button>
              </CardContent>
            </Card>

            {/* Expenses Card */}
            <Card>
              <CardHeader>
                <CardTitle>Expenses</CardTitle>
                <CardDescription>Track costs and settle balances</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-[#A99985]">
                  Log expenses, split costs, and see who owes what with automatic settlement calculations.
                </p>
                <Button onClick={() => router.push(`/trips/${tripId}/expenses`)} className="w-full">
                  View Expenses
                </Button>
              </CardContent>
            </Card>

            {/* Supplies Card */}
            <Card>
              <CardHeader>
                <CardTitle>Supplies & Packing</CardTitle>
                <CardDescription>Shared packing list</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-[#A99985]">
                  Coordinate what everyone is bringing. Claim items to avoid duplicates.
                </p>
                <Button onClick={() => router.push(`/trips/${tripId}/supplies`)} className="w-full">
                  View Supplies
                </Button>
              </CardContent>
            </Card>

            {/* Accommodation Card */}
            <Card>
              <CardHeader>
                <CardTitle>Accommodation & Logistics</CardTitle>
                <CardDescription>Where you're staying & important links</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-[#A99985]">
                  View accommodation details, door codes, WiFi, and shared links for reservations.
                </p>
                <Button onClick={() => router.push(`/trips/${tripId}/accommodation`)} className="w-full">
                  View Details
                </Button>
              </CardContent>
            </Card>

            {/* Availability Card */}
            <Card>
              <CardHeader>
                <CardTitle>Availability & Updates</CardTitle>
                <CardDescription>Schedule coordination & announcements</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-[#A99985]">
                  Share when you're available and see group announcements for trip updates.
                </p>
                <Button onClick={() => router.push(`/trips/${tripId}/availability`)} className="w-full">
                  View Availability
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Members Card */}
            <Card>
              <CardHeader>
                <CardTitle>Members</CardTitle>
                <CardDescription>
                  {trip.trip_members?.length || 0} {(trip.trip_members?.length || 0) === 1 ? 'person' : 'people'} on this trip
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MemberList members={trip.trip_members || []} inviteCode={trip.invite_code} />
              </CardContent>
            </Card>

            {/* Coming Soon Card */}
            <Card className="border-2 border-dashed border-gray-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <svg className="mr-2 h-5 w-5 text-[#70798C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Coming Soon
                </CardTitle>
                <CardDescription>Features in development</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-[#A99985]">
                  <li className="flex items-start">
                    <span className="mr-2 mt-0.5 text-[#70798C]">•</span>
                    <span>Rooming assignments</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 mt-0.5 text-[#70798C]">•</span>
                    <span>Transportation coordination</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 mt-0.5 text-[#70798C]">•</span>
                    <span>Payment integration (Venmo/Zelle)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
