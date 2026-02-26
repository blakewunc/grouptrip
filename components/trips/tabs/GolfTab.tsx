'use client'

import { TeeTimeList } from '@/components/golf/TeeTimeList'
import { Leaderboard } from '@/components/golf/Leaderboard'
import { EquipmentCoordination } from '@/components/golf/EquipmentCoordination'
import { GroupMaker } from '@/components/golf/GroupMaker'

interface GolfTabProps {
  tripId: string
  trip: any
  currentUserId: string | null
  isOrganizer: boolean
}

export function GolfTab({ tripId }: GolfTabProps) {
  return (
    <div className="space-y-6">
      <TeeTimeList tripId={tripId} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Leaderboard tripId={tripId} />
        <EquipmentCoordination tripId={tripId} />
      </div>
      <GroupMaker tripId={tripId} />
    </div>
  )
}
