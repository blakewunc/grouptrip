'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface RsvpStatusProps {
  tripId: string
  currentStatus: string
  onUpdate: () => void
}

export function RsvpStatus({ tripId, currentStatus, onUpdate }: RsvpStatusProps) {
  const [updating, setUpdating] = useState(false)

  const updateRsvp = async (newStatus: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/trips/${tripId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rsvp_status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update RSVP')
      }

      onUpdate()
    } catch (error: any) {
      alert(error.message || 'Failed to update RSVP')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="rounded-[5px] border border-[#DAD2BC] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[#252323]">Your RSVP</h3>
        <p className="text-sm text-[#A99985]">Let others know if you're coming</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={updating}
          onClick={() => updateRsvp('accepted')}
          className={
            currentStatus === 'accepted'
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'border-2 border-gray-300 bg-white text-[#A99985] hover:border-green-600 hover:bg-green-50 hover:text-green-700'
          }
          variant="ghost"
        >
          ✓ Going
        </Button>

        <Button
          size="sm"
          disabled={updating}
          onClick={() => updateRsvp('pending')}
          className={
            currentStatus === 'pending'
              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
              : 'border-2 border-gray-300 bg-white text-[#A99985] hover:border-yellow-500 hover:bg-yellow-50 hover:text-yellow-700'
          }
          variant="ghost"
        >
          ? Maybe
        </Button>

        <Button
          size="sm"
          disabled={updating}
          onClick={() => updateRsvp('declined')}
          className={
            currentStatus === 'declined'
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'border-2 border-gray-300 bg-white text-[#A99985] hover:border-red-600 hover:bg-red-50 hover:text-red-700'
          }
          variant="ghost"
        >
          ✗ Can't Go
        </Button>
      </div>

      {currentStatus && (
        <p className="mt-4 text-sm text-[#A99985]">
          Current status:{' '}
          <span className="font-semibold text-[#252323]">
            {currentStatus === 'accepted' ? 'Going' : currentStatus === 'declined' ? "Can't Go" : 'Maybe'}
          </span>
        </p>
      )}
    </div>
  )
}
