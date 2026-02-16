'use client'

import { useEffect, useState } from 'react'

interface AvailabilitySummaryCardProps {
  tripId: string
  memberCount: number
  onViewCalendar: () => void
}

export function AvailabilitySummaryCard({ tripId, memberCount, onViewCalendar }: AvailabilitySummaryCardProps) {
  const [submittedCount, setSubmittedCount] = useState(0)
  const [bestWindow, setBestWindow] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAvailability() {
      try {
        const response = await fetch(`/api/trips/${tripId}/availability`)
        if (response.ok) {
          const data = await response.json()
          const availability = data.availability || []

          // Count unique users who submitted
          const uniqueUsers = new Set(availability.map((a: any) => a.user_id))
          setSubmittedCount(uniqueUsers.size)

          // Find the most common overlapping window
          if (availability.length > 0) {
            const dateFreq: Record<string, number> = {}
            for (const a of availability) {
              const [sy, sm, sd] = a.start_date.split('-').map(Number)
              const [ey, em, ed] = a.end_date.split('-').map(Number)
              const start = new Date(sy, sm - 1, sd)
              const end = new Date(ey, em - 1, ed)
              for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const key = d.toISOString().split('T')[0]
                dateFreq[key] = (dateFreq[key] || 0) + 1
              }
            }

            // Find best consecutive dates
            const sorted = Object.entries(dateFreq).sort((a, b) => b[1] - a[1])
            if (sorted.length >= 2) {
              const topDate1 = sorted[0][0]
              // Find the adjacent date with highest frequency
              const topDates = sorted.slice(0, 4).map(([d]) => d).sort()
              const [by, bm, bd] = topDates[0].split('-').map(Number)
              const [ey2, em2, ed2] = topDates[topDates.length - 1].split('-').map(Number)
              const bestStart = new Date(by, bm - 1, bd)
              const bestEnd = new Date(ey2, em2 - 1, ed2)
              const startStr = bestStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              const endStr = bestEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              setBestWindow(`${startStr}-${endStr}`)
            } else if (sorted.length === 1) {
              const [by, bm, bd] = sorted[0][0].split('-').map(Number)
              const d = new Date(by, bm - 1, bd)
              setBestWindow(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
            }
          }
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchAvailability()
  }, [tripId])

  return (
    <div className="rounded-[8px] border border-[#DAD2BC] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <h3 className="mb-4 text-lg font-semibold text-[#252323]">Availability Summary</h3>

      {loading ? (
        <p className="text-sm text-[#A99985]">Loading...</p>
      ) : submittedCount === 0 ? (
        <div className="py-4 text-center">
          <p className="mb-3 text-sm text-[#A99985]">No availability added yet</p>
          <button
            onClick={onViewCalendar}
            className="inline-flex items-center gap-1.5 rounded-[5px] border border-[#DAD2BC] px-4 py-2 text-sm font-medium text-[#252323] transition-colors hover:bg-[#F5F1ED]"
          >
            Add your dates
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <p className="text-sm text-[#A99985]">
              <span className="font-semibold text-[#252323]">{submittedCount}</span> of{' '}
              <span className="font-semibold text-[#252323]">{memberCount}</span> members submitted dates
            </p>
            {bestWindow && (
              <p className="text-sm text-[#A99985]">
                Most available weekend:{' '}
                <span className="font-semibold text-[#252323]">{bestWindow}</span>
              </p>
            )}
          </div>

          <button
            onClick={onViewCalendar}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#70798C] transition-colors hover:text-[#252323]"
          >
            View Calendar
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}
