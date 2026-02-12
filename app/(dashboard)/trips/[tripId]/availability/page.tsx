'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTrip } from '@/lib/hooks/useTrip'
import { createClient } from '@/lib/supabase/client'

export default function AvailabilityPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const { trip, loading: tripLoading } = useTrip(tripId)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isOrganizer, setIsOrganizer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [availability, setAvailability] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [showAvailForm, setShowAvailForm] = useState(false)
  const [showAnnounceForm, setShowAnnounceForm] = useState(false)
  const [availForm, setAvailForm] = useState({ start_date: '', end_date: '', notes: '' })
  const [announceForm, setAnnounceForm] = useState({ title: '', content: '', is_pinned: false })

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)

      if (trip && user) {
        const member = trip.trip_members?.find(m => m.profiles.id === user.id)
        setIsOrganizer(member?.role === 'organizer')
      }
    }
    init()
  }, [trip, supabase.auth])

  useEffect(() => {
    if (tripId) {
      fetchData()
    }
  }, [tripId])

  async function fetchData() {
    setLoading(true)
    try {
      const [availRes, announceRes] = await Promise.all([
        fetch(`/api/trips/${tripId}/availability`),
        fetch(`/api/trips/${tripId}/announcements`)
      ])

      if (availRes.ok) {
        const data = await availRes.json()
        setAvailability(data.availability || [])
      }

      if (announceRes.ok) {
        const data = await announceRes.json()
        setAnnouncements(data.announcements || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddAvailability(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch(`/api/trips/${tripId}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(availForm),
      })

      if (!response.ok) {
        throw new Error('Failed to add availability')
      }

      setAvailForm({ start_date: '', end_date: '', notes: '' })
      setShowAvailForm(false)
      fetchData()
    } catch (error: any) {
      alert(error.message)
    }
  }

  async function handleDeleteAvailability(id: string) {
    if (!confirm('Delete this availability entry?')) return

    try {
      const response = await fetch(`/api/trips/${tripId}/availability/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete')
      }

      fetchData()
    } catch (error: any) {
      alert(error.message)
    }
  }

  async function handleAddAnnouncement(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch(`/api/trips/${tripId}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announceForm),
      })

      if (!response.ok) {
        throw new Error('Failed to post announcement')
      }

      setAnnounceForm({ title: '', content: '', is_pinned: false })
      setShowAnnounceForm(false)
      fetchData()
    } catch (error: any) {
      alert(error.message)
    }
  }

  async function handleDeleteAnnouncement(id: string) {
    if (!confirm('Delete this announcement?')) return

    try {
      const response = await fetch(`/api/trips/${tripId}/announcements/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete')
      }

      fetchData()
    } catch (error: any) {
      alert(error.message)
    }
  }

  async function togglePin(id: string, currentPinned: boolean) {
    try {
      const response = await fetch(`/api/trips/${tripId}/announcements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_pinned: !currentPinned }),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle pin')
      }

      fetchData()
    } catch (error: any) {
      alert(error.message)
    }
  }

  // Calculate date overlap
  function calculateBestDates() {
    if (availability.length === 0) return []

    const dateCounts: Record<string, { count: number; users: string[] }> = {}

    availability.forEach((entry) => {
      const start = new Date(entry.start_date)
      const end = new Date(entry.end_date)
      const userName = entry.user?.display_name || entry.user?.email || 'Unknown'

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0]
        if (!dateCounts[dateStr]) {
          dateCounts[dateStr] = { count: 0, users: [] }
        }
        dateCounts[dateStr].count++
        dateCounts[dateStr].users.push(userName)
      }
    })

    const sorted = Object.entries(dateCounts)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5)

    return sorted.map(([date, data]) => ({
      date,
      count: data.count,
      users: data.users,
      percentage: Math.round((data.count / (trip?.trip_members?.length || 1)) * 100)
    }))
  }

  const bestDates = calculateBestDates()

  if (tripLoading || loading || !currentUserId) {
    return (
      <div className="min-h-screen bg-[#F5F1ED] p-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-[#A99985]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-[#F5F1ED] p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-lg bg-red-50 p-4 text-red-800">Trip not found</div>
          <Button onClick={() => router.push('/trips')} className="mt-4">
            Back to Trips
          </Button>
        </div>
      </div>
    )
  }

  const myAvailability = availability.filter(a => a.user_id === currentUserId)
  const othersAvailability = availability.filter(a => a.user_id !== currentUserId)

  return (
    <div className="min-h-screen bg-[#F5F1ED] p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.push(`/trips/${tripId}`)}
            className="mb-4"
          >
            ← Back to Trip
          </Button>
          <h1 className="text-4xl font-bold tracking-tight text-[#252323]">
            Availability & Updates
          </h1>
          <p className="mt-2 text-[#A99985]">
            See when everyone is available and stay updated with trip announcements
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Availability */}
          <div className="space-y-6">
            {/* Best Dates Card */}
            {bestDates.length > 0 && (
              <Card className="border-2 border-[#70798C]">
                <CardHeader>
                  <CardTitle>🎯 Best Dates</CardTitle>
                  <CardDescription>Dates with most availability</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {bestDates.map((item, idx) => (
                      <div key={item.date} className="rounded-lg border border-[#DAD2BC] p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-[#252323]">
                              {new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-xs text-[#A99985]">
                              {item.count} / {trip.trip_members?.length} available ({item.percentage}%)
                            </p>
                          </div>
                          {idx === 0 && (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                              Best
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* My Availability */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Availability</CardTitle>
                    <CardDescription>When can you make it?</CardDescription>
                  </div>
                  {!showAvailForm && (
                    <Button size="sm" onClick={() => setShowAvailForm(true)}>
                      + Add Dates
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {showAvailForm && (
                  <form onSubmit={handleAddAvailability} className="mb-4 space-y-3 rounded-lg border-2 border-[#70798C] bg-pink-50 p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="start_date">From</Label>
                        <Input
                          id="start_date"
                          type="date"
                          value={availForm.start_date}
                          onChange={(e) => setAvailForm({ ...availForm, start_date: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="end_date">To</Label>
                        <Input
                          id="end_date"
                          type="date"
                          value={availForm.end_date}
                          onChange={(e) => setAvailForm({ ...availForm, end_date: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm">Add</Button>
                      <Button type="button" size="sm" variant="secondary" onClick={() => setShowAvailForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                {myAvailability.length === 0 ? (
                  <p className="py-8 text-center text-sm text-[#A99985]">
                    You haven't added your availability yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {myAvailability.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between rounded-lg border border-[#DAD2BC] p-3">
                        <div>
                          <p className="text-sm font-medium text-[#252323]">
                            {new Date(entry.start_date + 'T00:00:00').toLocaleDateString()} →{' '}
                            {new Date(entry.end_date + 'T00:00:00').toLocaleDateString()}
                          </p>
                          {entry.notes && (
                            <p className="text-xs text-[#A99985]">{entry.notes}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAvailability(entry.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Others' Availability */}
            {othersAvailability.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Group Availability</CardTitle>
                  <CardDescription>When others are available</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {othersAvailability.map((entry) => (
                      <div key={entry.id} className="rounded-lg border border-[#DAD2BC] p-3">
                        <p className="text-xs font-semibold text-[#70798C]">
                          {entry.user?.display_name || entry.user?.email}
                        </p>
                        <p className="text-sm text-[#252323]">
                          {new Date(entry.start_date + 'T00:00:00').toLocaleDateString()} →{' '}
                          {new Date(entry.end_date + 'T00:00:00').toLocaleDateString()}
                        </p>
                        {entry.notes && (
                          <p className="text-xs text-[#A99985]">{entry.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Announcements */}
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Trip Announcements</CardTitle>
                    <CardDescription>Updates from the organizer</CardDescription>
                  </div>
                  {isOrganizer && !showAnnounceForm && (
                    <Button size="sm" onClick={() => setShowAnnounceForm(true)}>
                      + Post Update
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {showAnnounceForm && (
                  <form onSubmit={handleAddAnnouncement} className="mb-6 space-y-3 rounded-lg border-2 border-[#70798C] bg-pink-50 p-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={announceForm.title}
                        onChange={(e) => setAnnounceForm({ ...announceForm, title: e.target.value })}
                        placeholder="Important update"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="content">Message</Label>
                      <textarea
                        id="content"
                        value={announceForm.content}
                        onChange={(e) => setAnnounceForm({ ...announceForm, content: e.target.value })}
                        placeholder="Share details about the trip..."
                        required
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_pinned"
                        checked={announceForm.is_pinned}
                        onChange={(e) => setAnnounceForm({ ...announceForm, is_pinned: e.target.checked })}
                      />
                      <Label htmlFor="is_pinned" className="text-sm">Pin this announcement</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm">Post</Button>
                      <Button type="button" size="sm" variant="secondary" onClick={() => setShowAnnounceForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                {announcements.length === 0 ? (
                  <p className="py-8 text-center text-sm text-[#A99985]">
                    No announcements yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {announcements.map((announcement) => (
                      <div
                        key={announcement.id}
                        className={`rounded-lg border-2 p-4 ${
                          announcement.is_pinned
                            ? 'border-[#70798C] bg-pink-50'
                            : 'border-[#DAD2BC] bg-white'
                        }`}
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            {announcement.is_pinned && (
                              <span className="mb-1 inline-block rounded bg-[#70798C] px-2 py-0.5 text-xs font-semibold text-white">
                                📌 PINNED
                              </span>
                            )}
                            <h3 className="font-semibold text-[#252323]">{announcement.title}</h3>
                          </div>
                          {announcement.created_by === currentUserId && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => togglePin(announcement.id, announcement.is_pinned)}
                                className="text-xs"
                              >
                                {announcement.is_pinned ? 'Unpin' : 'Pin'}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteAnnouncement(announcement.id)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                Delete
                              </Button>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-[#A99985] whitespace-pre-wrap">{announcement.content}</p>
                        <p className="mt-2 text-xs text-[#A99985]">
                          {announcement.created_by_profile?.display_name || announcement.created_by_profile?.email} •{' '}
                          {new Date(announcement.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
