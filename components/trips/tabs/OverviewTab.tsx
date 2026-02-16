'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
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
  const [pendingInvites, setPendingInvites] = useState<any[]>([])
  const [proposalEnabled, setProposalEnabled] = useState(trip.proposal_enabled || false)
  const [togglingProposal, setTogglingProposal] = useState(false)

  const currentMember = trip.trip_members?.find(
    (member: any) => member.profiles.id === currentUserId
  )

  const fetchPendingInvites = async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}/members`)
      if (response.ok) {
        const data = await response.json()
        setPendingInvites(data.pendingInvites || [])
      }
    } catch {
      // Silently fail - not critical
    }
  }

  useEffect(() => {
    if (isOrganizer) {
      fetchPendingInvites()
    }
  }, [tripId, isOrganizer])

  const handleToggleProposal = async () => {
    setTogglingProposal(true)
    try {
      const response = await fetch(`/api/trips/${tripId}/proposal`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposal_enabled: !proposalEnabled }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to toggle proposal')

      setProposalEnabled(!proposalEnabled)
      toast.success(proposalEnabled ? 'Proposal page disabled' : 'Proposal page enabled!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setTogglingProposal(false)
    }
  }

  const copyProposalLink = () => {
    const link = `${window.location.origin}/proposal/${trip.invite_code}`
    navigator.clipboard.writeText(link)
    toast.success('Proposal link copied!')
  }

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

        {/* Trip Proposal - Organizer Only */}
        {isOrganizer && (
          <Card>
            <CardHeader>
              <CardTitle>Trip Proposal</CardTitle>
              <CardDescription>Share a beautiful proposal page with friends to pitch this trip</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#252323]">
                  {proposalEnabled ? 'Proposal page is live' : 'Proposal page is off'}
                </span>
                <button
                  onClick={handleToggleProposal}
                  disabled={togglingProposal}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    proposalEnabled ? 'bg-[#4A7C59]' : 'bg-[#DAD2BC]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      proposalEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {proposalEnabled && (
                <Button variant="outline" size="sm" onClick={copyProposalLink} className="w-full">
                  Copy Proposal Link
                </Button>
              )}
            </CardContent>
          </Card>
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
            <MemberList
              members={trip.trip_members || []}
              inviteCode={trip.invite_code}
              tripId={tripId}
              isOrganizer={isOrganizer}
              currentUserId={currentUserId}
              pendingInvites={pendingInvites}
              onRefresh={fetchPendingInvites}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
