'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface TripHeroHeaderProps {
  trip: {
    id: string
    title: string
    destination: string
    start_date: string
    end_date: string
    status: string
  }
  isOrganizer: boolean
}

export function TripHeroHeader({ trip, isOrganizer }: TripHeroHeaderProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  // Parse dates as local to avoid timezone shift
  const [sy, sm, sd] = trip.start_date.split('-').map(Number)
  const [ey, em, ed] = trip.end_date.split('-').map(Number)
  const start = new Date(sy, sm - 1, sd)
  const end = new Date(ey, em - 1, ed)
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const daysAway = Math.round((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const startYear = start.getFullYear() !== end.getFullYear() ? `, ${start.getFullYear()}` : ''

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this trip? This action cannot be undone.')) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/trips/${trip.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete trip')
      router.push('/trips')
    } catch (error: any) {
      alert(error.message || 'Failed to delete trip')
      setIsDeleting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-white/20 text-white border border-white/30'
      case 'confirmed': return 'bg-[#4A7C59]/80 text-white border border-[#4A7C59]'
      case 'completed': return 'bg-white/20 text-white/80 border border-white/20'
      case 'cancelled': return 'bg-[#8B4444]/80 text-white border border-[#8B4444]'
      default: return 'bg-white/20 text-white border border-white/30'
    }
  }

  const getCountdownText = () => {
    if (daysAway < 0) return 'Trip in progress'
    if (daysAway === 0) return 'Trip starts today!'
    if (daysAway === 1) return 'Starts tomorrow'
    return `${daysAway} days away`
  }

  return (
    <div className="relative overflow-hidden rounded-[8px]">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#3a3535] via-[#4a4545] to-[#5a5252]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

      <div className="relative z-10 px-8 py-10 sm:px-10 sm:py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          {/* Left: Trip info */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusColor(trip.status)}`}>
                {trip.status}
              </span>
              {daysAway >= 0 && (
                <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
                  {getCountdownText()}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {trip.title}
            </h1>

            <div className="flex flex-wrap items-center gap-5 text-white/70">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-medium text-white/90">{trip.destination}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">{startStr}{startYear} - {endStr} ({days} {days === 1 ? 'day' : 'days'})</span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          {isOrganizer && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => router.push(`/trips/${trip.id}/edit`)}
                className="inline-flex items-center gap-1.5 rounded-[5px] border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Trip
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 rounded-[5px] border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 backdrop-blur-sm transition-colors hover:bg-red-500/20 hover:text-white hover:border-red-400/30"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {isDeleting ? 'Deleting...' : 'Delete Trip'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
