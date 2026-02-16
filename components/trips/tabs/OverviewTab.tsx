'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MemberList } from '@/components/trips/MemberList'
import { RsvpStatus } from '@/components/trips/RsvpStatus'

interface OverviewTabProps {
  tripId: string
  trip: any
  currentUserId: string | null
  isOrganizer: boolean
}

export function OverviewTab({ tripId, trip, currentUserId, isOrganizer }: OverviewTabProps) {
  const router = useRouter()

  const currentMember = trip.trip_members?.find(
    (member: any) => member.profiles.id === currentUserId
  )

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left Column */}
      <div className="space-y-6">
        {/* Description */}
        {trip.description && (
          <Card>
            <CardHeader>
              <CardTitle>About this trip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed text-[#A99985]">{trip.description}</p>
            </CardContent>
          </Card>
        )}

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
                <span className="mr-2 text-2xl">{'\u26F3'}</span>
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
                <span className="mr-2 text-2xl">{'\u26F7\uFE0F'}</span>
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

        {/* Availability Card */}
        <Card>
          <CardHeader>
            <CardTitle>Availability & Updates</CardTitle>
            <CardDescription>Schedule coordination & announcements</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-[#A99985]">
              Share when you&apos;re available and see group announcements for trip updates.
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
      </div>
    </div>
  )
}
