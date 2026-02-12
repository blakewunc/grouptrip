'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTrip } from '@/lib/hooks/useTrip'
import { createClient } from '@/lib/supabase/client'

type DocumentCategory = 'accommodation' | 'reservation' | 'activity' | 'flight' | 'other'

interface TripDocument {
  id: string
  title: string
  url: string
  description: string | null
  category: DocumentCategory
  created_by: string
  created_by_profile?: {
    display_name: string | null
    email: string
  }
}

export default function AccommodationPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const { trip, loading: tripLoading } = useTrip(tripId)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isOrganizer, setIsOrganizer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [accommodation, setAccommodation] = useState<any>(null)
  const [documents, setDocuments] = useState<TripDocument[]>([])
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    check_in: '',
    check_out: '',
    door_code: '',
    wifi_name: '',
    wifi_password: '',
    house_rules: '',
    notes: '',
  })
  const [newDoc, setNewDoc] = useState({
    title: '',
    url: '',
    description: '',
    category: 'other' as DocumentCategory
  })
  const [showDocForm, setShowDocForm] = useState(false)

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
      // Fetch accommodation
      const accRes = await fetch(`/api/trips/${tripId}/accommodation`)
      if (accRes.ok) {
        const accData = await accRes.json()
        if (accData.accommodation) {
          setAccommodation(accData.accommodation)
          setFormData({
            name: accData.accommodation.name || '',
            address: accData.accommodation.address || '',
            check_in: accData.accommodation.check_in ? accData.accommodation.check_in.slice(0, 16) : '',
            check_out: accData.accommodation.check_out ? accData.accommodation.check_out.slice(0, 16) : '',
            door_code: accData.accommodation.door_code || '',
            wifi_name: accData.accommodation.wifi_name || '',
            wifi_password: accData.accommodation.wifi_password || '',
            house_rules: accData.accommodation.house_rules || '',
            notes: accData.accommodation.notes || '',
          })
        }
      }

      // Fetch documents
      const docsRes = await fetch(`/api/trips/${tripId}/documents`)
      if (docsRes.ok) {
        const docsData = await docsRes.json()
        setDocuments(docsData.documents || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveAccommodation(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await fetch(`/api/trips/${tripId}/accommodation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to save accommodation')
      }

      const data = await response.json()
      setAccommodation(data.accommodation)
      alert('Accommodation details saved!')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleAddDocument(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch(`/api/trips/${tripId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoc),
      })

      if (!response.ok) {
        throw new Error('Failed to add document')
      }

      setNewDoc({ title: '', url: '', description: '', category: 'other' })
      setShowDocForm(false)
      fetchData()
    } catch (error: any) {
      alert(error.message)
    }
  }

  async function handleDeleteDocument(docId: string) {
    if (!confirm('Delete this link?')) return

    try {
      const response = await fetch(`/api/trips/${tripId}/documents/${docId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete document')
      }

      fetchData()
    } catch (error: any) {
      alert(error.message)
    }
  }

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

  const categoryLabels = {
    accommodation: '🏠 Accommodation',
    reservation: '🍽️ Reservation',
    activity: '⛳ Activity',
    flight: '✈️ Flight',
    other: '📄 Other'
  }

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
            Accommodation & Logistics
          </h1>
          <p className="mt-2 text-[#A99985]">
            Manage where you're staying and important trip documents
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Accommodation Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Accommodation Details</CardTitle>
                <CardDescription>
                  {isOrganizer ? 'Add details about where the group is staying' : 'View accommodation information'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isOrganizer ? (
                  <form onSubmit={handleSaveAccommodation} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Property Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Airbnb, Hotel name, etc."
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="123 Main St, City, State"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="check_in">Check-in</Label>
                        <Input
                          id="check_in"
                          type="datetime-local"
                          value={formData.check_in}
                          onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="check_out">Check-out</Label>
                        <Input
                          id="check_out"
                          type="datetime-local"
                          value={formData.check_out}
                          onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="door_code">Door Code</Label>
                        <Input
                          id="door_code"
                          value={formData.door_code}
                          onChange={(e) => setFormData({ ...formData, door_code: e.target.value })}
                          placeholder="1234"
                        />
                      </div>

                      <div>
                        <Label htmlFor="wifi_name">WiFi Network</Label>
                        <Input
                          id="wifi_name"
                          value={formData.wifi_name}
                          onChange={(e) => setFormData({ ...formData, wifi_name: e.target.value })}
                          placeholder="Network name"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="wifi_password">WiFi Password</Label>
                      <Input
                        id="wifi_password"
                        value={formData.wifi_password}
                        onChange={(e) => setFormData({ ...formData, wifi_password: e.target.value })}
                        placeholder="Password"
                      />
                    </div>

                    <div>
                      <Label htmlFor="house_rules">House Rules</Label>
                      <Input
                        id="house_rules"
                        value={formData.house_rules}
                        onChange={(e) => setFormData({ ...formData, house_rules: e.target.value })}
                        placeholder="No smoking, quiet hours 10pm-8am, etc."
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Input
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Parking info, nearby amenities, etc."
                      />
                    </div>

                    <Button type="submit" disabled={saving} className="w-full">
                      {saving ? 'Saving...' : 'Save Details'}
                    </Button>
                  </form>
                ) : accommodation ? (
                  <div className="space-y-4 text-sm">
                    {accommodation.name && (
                      <div>
                        <p className="font-semibold text-[#252323]">Property</p>
                        <p className="text-[#A99985]">{accommodation.name}</p>
                      </div>
                    )}
                    {accommodation.address && (
                      <div>
                        <p className="font-semibold text-[#252323]">Address</p>
                        <p className="text-[#A99985]">{accommodation.address}</p>
                      </div>
                    )}
                    {(accommodation.check_in || accommodation.check_out) && (
                      <div>
                        <p className="font-semibold text-[#252323]">Check-in/Check-out</p>
                        <p className="text-[#A99985]">
                          {accommodation.check_in && new Date(accommodation.check_in).toLocaleString()}
                          {' → '}
                          {accommodation.check_out && new Date(accommodation.check_out).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {accommodation.door_code && (
                      <div>
                        <p className="font-semibold text-[#252323]">Door Code</p>
                        <p className="font-mono text-lg text-[#252323]">{accommodation.door_code}</p>
                      </div>
                    )}
                    {accommodation.wifi_name && (
                      <div>
                        <p className="font-semibold text-[#252323]">WiFi</p>
                        <p className="text-[#A99985]">Network: {accommodation.wifi_name}</p>
                        {accommodation.wifi_password && (
                          <p className="font-mono text-[#252323]">Password: {accommodation.wifi_password}</p>
                        )}
                      </div>
                    )}
                    {accommodation.house_rules && (
                      <div>
                        <p className="font-semibold text-[#252323]">House Rules</p>
                        <p className="text-[#A99985]">{accommodation.house_rules}</p>
                      </div>
                    )}
                    {accommodation.notes && (
                      <div>
                        <p className="font-semibold text-[#252323]">Notes</p>
                        <p className="text-[#A99985]">{accommodation.notes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-[#A99985]">
                    No accommodation details yet. The organizer can add them.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Documents & Links */}
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Documents & Links</CardTitle>
                    <CardDescription>Shared links for reservations, listings, etc.</CardDescription>
                  </div>
                  {!showDocForm && (
                    <Button size="sm" onClick={() => setShowDocForm(true)}>
                      + Add Link
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {showDocForm && (
                  <form onSubmit={handleAddDocument} className="mb-6 space-y-3 rounded-lg border-2 border-[#70798C] bg-pink-50 p-4">
                    <div>
                      <Label htmlFor="doc_title">Title *</Label>
                      <Input
                        id="doc_title"
                        value={newDoc.title}
                        onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                        placeholder="Airbnb Listing, Tee Time Confirmation, etc."
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="doc_url">URL *</Label>
                      <Input
                        id="doc_url"
                        type="url"
                        value={newDoc.url}
                        onChange={(e) => setNewDoc({ ...newDoc, url: e.target.value })}
                        placeholder="https://..."
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="doc_category">Category</Label>
                      <select
                        id="doc_category"
                        value={newDoc.category}
                        onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value as any })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="accommodation">Accommodation</option>
                        <option value="reservation">Reservation</option>
                        <option value="activity">Activity</option>
                        <option value="flight">Flight</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm">Add Link</Button>
                      <Button type="button" size="sm" variant="secondary" onClick={() => setShowDocForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                {documents.length === 0 ? (
                  <p className="py-8 text-center text-sm text-[#A99985]">
                    No links added yet. Add important URLs like Airbnb listings, tee times, flight confirmations, etc.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-start justify-between rounded-lg border border-[#DAD2BC] p-3"
                      >
                        <div className="flex-1">
                          <p className="text-xs text-[#A99985]">{categoryLabels[doc.category]}</p>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-[#70798C] hover:underline"
                          >
                            {doc.title}
                          </a>
                          {doc.description && (
                            <p className="mt-1 text-xs text-[#A99985]">{doc.description}</p>
                          )}
                          <p className="mt-1 text-xs text-[#A99985]">
                            Added by {doc.created_by_profile?.display_name || doc.created_by_profile?.email}
                          </p>
                        </div>
                        {doc.created_by === currentUserId && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        )}
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
