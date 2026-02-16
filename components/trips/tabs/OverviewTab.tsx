'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { RsvpStatus } from '@/components/trips/RsvpStatus'
import { TripProgressCard } from '@/components/trips/overview/TripProgressCard'
import { ItineraryPreviewCard } from '@/components/trips/overview/ItineraryPreviewCard'
import { BudgetSnapshotCard } from '@/components/trips/overview/BudgetSnapshotCard'
import { TripMembersCard } from '@/components/trips/overview/TripMembersCard'
import { AvailabilitySummaryCard } from '@/components/trips/overview/AvailabilitySummaryCard'
import { AnnouncementsCard } from '@/components/trips/overview/AnnouncementsCard'
import { useBudget } from '@/lib/hooks/useBudget'
import { useItinerary } from '@/lib/hooks/useItinerary'

interface OverviewTabProps {
  tripId: string
  trip: any
  currentUserId: string | null
  isOrganizer: boolean
  onSwitchTab: (tab: string) => void
}

export function OverviewTab({ tripId, trip, currentUserId, isOrganizer, onSwitchTab }: OverviewTabProps) {
  const router = useRouter()
  const [proposalEnabled, setProposalEnabled] = useState(trip.proposal_enabled || false)
  const [togglingProposal, setTogglingProposal] = useState(false)
  const [availabilityCount, setAvailabilityCount] = useState(0)

  const { categories } = useBudget(tripId)
  const { items: itineraryItems } = useItinerary(tripId)

  const members = trip.trip_members || []
  const memberCount = members.length

  const currentMember = members.find(
    (member: any) => member.profiles.id === currentUserId
  )

  // Fetch availability count
  useEffect(() => {
    async function fetchAvailability() {
      try {
        const response = await fetch(`/api/trips/${tripId}/availability`)
        if (response.ok) {
          const data = await response.json()
          const uniqueUsers = new Set((data.availability || []).map((a: any) => a.user_id))
          setAvailabilityCount(uniqueUsers.size)
        }
      } catch {
        // Silently fail
      }
    }
    fetchAvailability()
  }, [tripId])

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

  // Compute progress data
  const respondedCount = members.filter((m: any) => m.rsvp_status === 'accepted' || m.rsvp_status === 'declined' || m.rsvp_status === 'maybe').length
  const budgetTotal = categories.reduce((sum: number, c: any) => sum + (c.estimated_cost || 0), 0)
  const perPerson = memberCount > 0 ? budgetTotal / memberCount : 0
  const currentBudgetCap = currentMember?.budget_cap || null

  // Group itinerary by date for preview
  const itineraryByDate = itineraryItems.reduce((acc: any, item: any) => {
    if (!acc[item.date]) acc[item.date] = []
    acc[item.date].push(item)
    return acc
  }, {} as Record<string, any[]>)

  const itineraryDays = Object.keys(itineraryByDate)
    .sort()
    .map((date) => ({
      date,
      items: itineraryByDate[date].sort((a: any, b: any) => (a.time || '').localeCompare(b.time || '')),
    }))

  return (
    <div className="space-y-6">
      {/* RSVP Status */}
      {currentMember && (
        <RsvpStatus
          tripId={trip.id}
          currentStatus={currentMember.rsvp_status}
          onUpdate={() => {}}
        />
      )}

      {/* Main 2-column Dashboard */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Trip Progress */}
          <TripProgressCard
            membersRespondedCount={respondedCount}
            membersTotalCount={memberCount}
            budgetCategoriesCount={categories.length}
            activitiesPlannedCount={itineraryItems.length}
            availabilitySubmittedCount={availabilityCount}
            onViewItinerary={() => onSwitchTab('itinerary')}
          />

          {/* Itinerary + Budget side by side */}
          <div className="grid gap-6 sm:grid-cols-2">
            <ItineraryPreviewCard
              days={itineraryDays}
              onViewFull={() => onSwitchTab('itinerary')}
              onAddActivity={() => onSwitchTab('itinerary')}
            />
            <BudgetSnapshotCard
              totalEstimated={budgetTotal}
              perPerson={perPerson}
              memberCount={memberCount}
              budgetCap={currentBudgetCap}
              onViewBudget={() => onSwitchTab('budget')}
              onAddCategory={() => onSwitchTab('budget')}
            />
          </div>

          {/* Trip Proposal - Organizer Only */}
          {isOrganizer && (
            <div className="rounded-[8px] border border-[#DAD2BC] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-[#252323]">Trip Proposal</h3>
                  <p className="text-sm text-[#A99985]">Share a proposal page with friends</p>
                </div>
                <div className="flex items-center gap-3">
                  {proposalEnabled && (
                    <button
                      onClick={copyProposalLink}
                      className="text-sm font-medium text-[#70798C] transition-colors hover:text-[#252323]"
                    >
                      Copy Link
                    </button>
                  )}
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
              </div>
            </div>
          )}

          {/* Sport Module Links */}
          {trip.trip_type === 'golf' && (
            <div className="rounded-[8px] border border-[#70798C] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{'\u26F3'}</span>
                  <div>
                    <h3 className="text-base font-semibold text-[#252323]">Golf Module</h3>
                    <p className="text-sm text-[#A99985]">Tee times, scorecards, and equipment</p>
                  </div>
                </div>
                <Button onClick={() => router.push(`/trips/${tripId}/golf`)} size="sm">
                  Manage
                </Button>
              </div>
            </div>
          )}

          {trip.trip_type === 'ski' && (
            <div className="rounded-[8px] border border-[#70798C] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{'\u26F7\uFE0F'}</span>
                  <div>
                    <h3 className="text-base font-semibold text-[#252323]">Ski Module</h3>
                    <p className="text-sm text-[#A99985]">Lift tickets, abilities, and rentals</p>
                  </div>
                </div>
                <Button onClick={() => router.push(`/trips/${tripId}/ski`)} size="sm">
                  Manage
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <TripMembersCard
            members={members}
            inviteCode={trip.invite_code}
            onInviteMore={() => {
              const link = `${window.location.origin}/invite/${trip.invite_code}`
              navigator.clipboard.writeText(link)
              toast.success('Invite link copied!')
            }}
          />

          <AvailabilitySummaryCard
            tripId={tripId}
            memberCount={memberCount}
            onViewCalendar={() => router.push(`/trips/${tripId}/availability`)}
          />

          <AnnouncementsCard
            tripId={tripId}
            isOrganizer={isOrganizer}
          />
        </div>
      </div>
    </div>
  )
}
