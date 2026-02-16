'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface TripSummary {
  id: string
  title: string
  trip_type: string | null
}

interface TripSwitcherProps {
  currentTripId: string
  currentTripTitle: string
  currentTripType?: string | null
}

export function TripSwitcher({ currentTripId, currentTripTitle, currentTripType }: TripSwitcherProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [trips, setTrips] = useState<TripSummary[]>([])
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch user's trips when dropdown opens
  useEffect(() => {
    if (!open) return

    async function fetchTrips() {
      setLoading(true)
      try {
        const res = await fetch('/api/trips')
        if (res.ok) {
          const data = await res.json()
          setTrips(data.trips || [])
        }
      } catch (error) {
        console.error('Failed to fetch trips:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrips()
  }, [open])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-[5px] border border-[#DAD2BC] bg-white px-4 py-2 text-sm font-medium text-[#252323] shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-colors hover:bg-[#F5F1ED]"
      >
        <svg className="h-4 w-4 text-[#A99985]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
        <span className="max-w-[200px] truncate">{currentTripTitle}</span>
        <svg
          className={`h-4 w-4 text-[#A99985] transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[280px] rounded-[5px] border border-[#DAD2BC] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
          {/* My Trips link */}
          <button
            onClick={() => {
              router.push('/trips')
              setOpen(false)
            }}
            className="flex w-full items-center gap-2 border-b border-[#DAD2BC] px-4 py-3 text-left text-sm text-[#70798C] hover:bg-[#F5F1ED]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            My Trips
          </button>

          {/* Trip list */}
          <div className="max-h-[300px] overflow-y-auto py-1">
            {loading ? (
              <p className="px-4 py-3 text-sm text-[#A99985]">Loading...</p>
            ) : trips.length === 0 ? (
              <p className="px-4 py-3 text-sm text-[#A99985]">No trips found</p>
            ) : (
              trips.map((trip) => (
                <button
                  key={trip.id}
                  onClick={() => {
                    if (trip.id !== currentTripId) {
                      router.push(`/trips/${trip.id}`)
                    }
                    setOpen(false)
                  }}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors hover:bg-[#F5F1ED] ${
                    trip.id === currentTripId ? 'bg-[#F5F1ED] font-medium text-[#252323]' : 'text-[#252323]'
                  }`}
                >
                  <span className="truncate">{trip.title}</span>
                  {trip.id === currentTripId && (
                    <svg className="ml-2 h-4 w-4 flex-shrink-0 text-[#70798C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Golf Planner link (conditional) */}
          {currentTripType === 'golf' && (
            <button
              onClick={() => {
                router.push(`/trips/${currentTripId}/golf`)
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 border-t border-[#DAD2BC] px-4 py-3 text-left text-sm text-[#70798C] hover:bg-[#F5F1ED]"
            >
              {'\u26F3'} Golf Planner
            </button>
          )}

          {/* Ski Planner link (conditional) */}
          {currentTripType === 'ski' && (
            <button
              onClick={() => {
                router.push(`/trips/${currentTripId}/ski`)
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 border-t border-[#DAD2BC] px-4 py-3 text-left text-sm text-[#70798C] hover:bg-[#F5F1ED]"
            >
              {'\u26F7\uFE0F'} Ski Planner
            </button>
          )}
        </div>
      )}
    </div>
  )
}
