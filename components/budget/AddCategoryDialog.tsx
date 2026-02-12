'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface AddCategoryDialogProps {
  tripId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddCategoryDialog({ tripId, open, onOpenChange, onSuccess }: AddCategoryDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    estimated_cost: '',
    split_type: 'equal' as 'equal' | 'custom' | 'none',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/trips/${tripId}/budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create category')
      }

      // Reset form
      setFormData({
        name: '',
        estimated_cost: '',
        split_type: 'equal',
      })

      onOpenChange(false)
      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Add Budget Category</DialogTitle>
        <DialogDescription>
          Add a new expense category to your trip budget
        </DialogDescription>
      </DialogHeader>

      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Hotel, Flights, Activities"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated_cost">Estimated Cost *</Label>
            <Input
              id="estimated_cost"
              type="number"
              step="0.01"
              min="0"
              value={formData.estimated_cost}
              onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
              placeholder="0.00"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="split_type">Split Type *</Label>
            <Select
              value={formData.split_type}
              onValueChange={(value) =>
                setFormData({ ...formData, split_type: value as 'equal' | 'custom' | 'none' })
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equal">Equal Split - Divide evenly among members</SelectItem>
                <SelectItem value="custom">Custom Split - Assign amounts manually</SelectItem>
                <SelectItem value="none">No Split - Group expense (not per person)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
