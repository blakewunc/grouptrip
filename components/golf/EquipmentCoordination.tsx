'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

interface EquipmentCoordinationProps {
  tripId: string
}

interface Equipment {
  id: string
  user_id: string
  needs_clubs: boolean
  needs_cart: boolean
  needs_push_cart: boolean
  notes: string | null
  user_name: string
}

export function EquipmentCoordination({ tripId }: EquipmentCoordinationProps) {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [myEquipment, setMyEquipment] = useState<Equipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)

      // Fetch equipment data
      await fetchEquipment()
    }

    init()
  }, [tripId, supabase.auth])

  async function fetchEquipment() {
    try {
      const response = await fetch(`/api/trips/${tripId}/golf/equipment`)
      if (response.ok) {
        const data = await response.json()
        setEquipment(data.equipment || [])

        // Find current user's equipment
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const mine = data.equipment?.find((e: Equipment) => e.user_id === user.id)
          setMyEquipment(mine || null)
        }
      }
    } catch (error) {
      console.error('Failed to fetch equipment:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      needs_clubs: formData.get('needs_clubs') === 'on',
      needs_cart: formData.get('needs_cart') === 'on',
      needs_push_cart: formData.get('needs_push_cart') === 'on',
      notes: formData.get('notes') as string,
    }

    try {
      const response = await fetch(`/api/trips/${tripId}/golf/equipment`, {
        method: myEquipment ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        await fetchEquipment()
      }
    } catch (error) {
      console.error('Failed to save equipment:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-[#A99985]">Loading...</p>
  }

  return (
    <div className="space-y-6">
      {/* My Equipment Needs */}
      <div>
        <h4 className="font-medium text-[#252323] mb-3">My Equipment Needs</h4>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="needs_clubs"
                defaultChecked={myEquipment?.needs_clubs}
                className="h-4 w-4 rounded border-[#CEC5B0] text-[#70798C] focus:ring-[#70798C]"
              />
              <span className="text-sm text-[#252323]">Need rental clubs</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="needs_cart"
                defaultChecked={myEquipment?.needs_cart}
                className="h-4 w-4 rounded border-[#CEC5B0] text-[#70798C] focus:ring-[#70798C]"
              />
              <span className="text-sm text-[#252323]">Need golf cart</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="needs_push_cart"
                defaultChecked={myEquipment?.needs_push_cart}
                className="h-4 w-4 rounded border-[#CEC5B0] text-[#70798C] focus:ring-[#70798C]"
              />
              <span className="text-sm text-[#252323]">Need push cart</span>
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Club preferences, cart sharing, etc."
              defaultValue={myEquipment?.notes || ''}
              disabled={saving}
            />
          </div>

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? 'Saving...' : 'Save Equipment Needs'}
          </Button>
        </form>
      </div>

      {/* Group Summary */}
      {equipment.length > 0 && (
        <div className="pt-4 border-t border-[#DAD2BC]">
          <h4 className="font-medium text-[#252323] mb-3">Group Summary</h4>
          <div className="space-y-2">
            {equipment.map((eq) => (
              <div
                key={eq.id}
                className="rounded-[5px] border border-[#DAD2BC] bg-white p-3"
              >
                <p className="font-medium text-[#252323] mb-1">{eq.user_name}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {eq.needs_clubs && (
                    <span className="rounded-full bg-[#F5F1ED] px-2 py-1 text-[#252323]">
                      Clubs
                    </span>
                  )}
                  {eq.needs_cart && (
                    <span className="rounded-full bg-[#F5F1ED] px-2 py-1 text-[#252323]">
                      Cart
                    </span>
                  )}
                  {eq.needs_push_cart && (
                    <span className="rounded-full bg-[#F5F1ED] px-2 py-1 text-[#252323]">
                      Push Cart
                    </span>
                  )}
                  {!eq.needs_clubs && !eq.needs_cart && !eq.needs_push_cart && (
                    <span className="text-[#A99985]">No rentals needed</span>
                  )}
                </div>
                {eq.notes && (
                  <p className="text-xs text-[#A99985] mt-2">{eq.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
