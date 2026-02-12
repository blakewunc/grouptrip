'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog } from '@/components/ui/dialog'

interface AddItemDialogProps {
  tripId: string
  onSuccess: () => void
}

export function AddItemDialog({ tripId, onSuccess }: AddItemDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    time: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/trips/${tripId}/itinerary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add item')
      }

      // Reset form and close dialog
      setFormData({
        title: '',
        description: '',
        location: '',
        date: '',
        time: '',
      })
      setOpen(false)
      onSuccess()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add Activity</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-[5px] border border-[#DAD2BC] bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-2xl font-bold text-[#252323]">Add Activity</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#252323]">
                  Activity Name*
                </label>
                <Input
                  required
                  placeholder="e.g., Golf at Pebble Beach"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#252323]">
                  Description
                </label>
                <Textarea
                  placeholder="Add details about this activity..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#252323]">
                  Location
                </label>
                <Input
                  placeholder="e.g., Pebble Beach Golf Links"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#252323]">
                    Date*
                  </label>
                  <Input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#252323]">
                    Time
                  </label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Activity'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </>
  )
}
