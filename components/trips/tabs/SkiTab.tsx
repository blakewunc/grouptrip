'use client'

import { LiftTicketCoordination } from '@/components/ski/LiftTicketCoordination'
import { AbilityLevelTracker } from '@/components/ski/AbilityLevelTracker'
import { EquipmentRentals } from '@/components/ski/EquipmentRentals'

interface SkiTabProps {
  tripId: string
  trip: any
  currentUserId: string | null
  isOrganizer: boolean
}

export function SkiTab({ tripId }: SkiTabProps) {
  return (
    <div className="space-y-6">
      <LiftTicketCoordination tripId={tripId} />
      <div className="grid gap-6 lg:grid-cols-2">
        <AbilityLevelTracker tripId={tripId} />
        <EquipmentRentals tripId={tripId} />
      </div>
    </div>
  )
}
