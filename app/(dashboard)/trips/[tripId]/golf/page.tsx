'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TeeTimeList } from '@/components/golf/TeeTimeList'
import { EquipmentCoordination } from '@/components/golf/EquipmentCoordination'
import { Leaderboard } from '@/components/golf/Leaderboard'

export default function GolfPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params)
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#F5F1ED] p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#252323]">
              ⛳ Golf Module
            </h1>
            <p className="text-[#A99985]">Manage tee times, scores, and equipment</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            ← Back to Trip
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Tee Times */}
            <Card>
              <CardHeader>
                <CardTitle>Tee Times</CardTitle>
                <CardDescription>Schedule rounds and assign foursomes</CardDescription>
              </CardHeader>
              <CardContent>
                <TeeTimeList tripId={tripId} />
              </CardContent>
            </Card>

            {/* Equipment */}
            <Card>
              <CardHeader>
                <CardTitle>Equipment Coordination</CardTitle>
                <CardDescription>Track who needs rentals</CardDescription>
              </CardHeader>
              <CardContent>
                <EquipmentCoordination tripId={tripId} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
                <CardDescription>Scores from all rounds</CardDescription>
              </CardHeader>
              <CardContent>
                <Leaderboard tripId={tripId} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
