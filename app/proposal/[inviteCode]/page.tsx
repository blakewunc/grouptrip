'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface ProposalData {
  trip: {
    title: string
    destination: string | null
    start_date: string | null
    end_date: string | null
    description: string | null
    budget_total: number | null
    trip_type: string
    status: string
    invite_code: string
    member_count: number
    accepted_count: number
  }
  categories: Array<{
    id: string
    name: string
    estimated_cost: number
    split_type: string
  }>
  itinerary: Array<{
    id: string
    title: string
    description: string | null
    date: string
    time: string | null
    location: string | null
  }>
}

export default function ProposalPage() {
  const params = useParams()
  const router = useRouter()
  const inviteCode = params.inviteCode as string
  const [data, setData] = useState<ProposalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const response = await fetch(`/api/proposal/${inviteCode}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('This proposal is not available.')
          } else {
            setError('Something went wrong.')
          }
          return
        }
        const result = await response.json()
        setData(result)
      } catch {
        setError('Failed to load proposal.')
      } finally {
        setLoading(false)
      }
    }

    fetchProposal()
  }, [inviteCode])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F1ED]">
        <div className="text-[#A99985]">Loading proposal...</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F1ED]">
        <div className="max-w-md rounded-[5px] border border-[#DAD2BC] bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h1 className="mb-2 text-xl font-bold text-[#252323]">Proposal Not Found</h1>
          <p className="text-[#A99985]">{error || 'This proposal does not exist or has been disabled.'}</p>
        </div>
      </div>
    )
  }

  const { trip, categories, itinerary } = data

  const totalBudget = categories.reduce((sum, cat) => sum + (cat.estimated_cost || 0), 0)
  const perPerson = trip.member_count > 0 ? totalBudget / trip.member_count : totalBudget

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateRange = () => {
    if (!trip.start_date) return null
    const start = formatDate(trip.start_date)
    if (!trip.end_date) return start
    const end = formatDate(trip.end_date)
    return `${start} \u2013 ${end}`
  }

  // Group itinerary by date
  const itineraryByDate = itinerary.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = []
    acc[item.date].push(item)
    return acc
  }, {} as Record<string, typeof itinerary>)

  const dates = Object.keys(itineraryByDate).sort()

  return (
    <div className="min-h-screen bg-[#F5F1ED]">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-[#70798C]">
            Trip Proposal
          </p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-[#252323] sm:text-5xl">
            {trip.title}
          </h1>
          {trip.destination && (
            <p className="mb-2 text-lg text-[#A99985]">{trip.destination}</p>
          )}
          {formatDateRange() && (
            <p className="text-base text-[#A99985]">{formatDateRange()}</p>
          )}
          {trip.description && (
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#A99985]">
              {trip.description}
            </p>
          )}
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-[#A99985]">
            <span>{trip.member_count} invited</span>
            <span className="text-[#DAD2BC]">{'\u2022'}</span>
            <span>{trip.accepted_count} confirmed</span>
          </div>
        </div>
      </div>

      {/* Budget Section */}
      {categories.length > 0 && (
        <div className="mx-auto max-w-3xl px-6 py-12">
          <h2 className="mb-6 text-center text-sm font-medium uppercase tracking-widest text-[#70798C]">
            Estimated Budget
          </h2>

          {/* Budget Summary Cards */}
          <div className="mb-8 grid grid-cols-3 gap-4">
            <div className="rounded-[5px] border border-[#DAD2BC] bg-white p-5 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <p className="text-2xl font-bold text-[#252323]">
                ${totalBudget.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-[#A99985]">Total Budget</p>
            </div>
            <div className="rounded-[5px] border border-[#DAD2BC] bg-white p-5 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <p className="text-2xl font-bold text-[#252323]">
                ${Math.round(perPerson).toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-[#A99985]">Per Person</p>
            </div>
            <div className="rounded-[5px] border border-[#DAD2BC] bg-white p-5 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <p className="text-2xl font-bold text-[#252323]">
                {trip.member_count}
              </p>
              <p className="mt-1 text-xs text-[#A99985]">People</p>
            </div>
          </div>

          {/* Budget Breakdown */}
          <div className="rounded-[5px] border border-[#DAD2BC] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#252323]">
              Breakdown
            </h3>
            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between border-b border-[#F5F1ED] pb-3 last:border-0 last:pb-0">
                  <span className="text-sm text-[#252323]">{cat.name}</span>
                  <span className="text-sm font-medium text-[#252323]">
                    ${cat.estimated_cost.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Itinerary Section */}
      {dates.length > 0 && (
        <div className="mx-auto max-w-3xl px-6 py-12">
          <h2 className="mb-6 text-center text-sm font-medium uppercase tracking-widest text-[#70798C]">
            Planned Activities
          </h2>

          <div className="space-y-6">
            {dates.map((date) => (
              <div key={date}>
                <h3 className="mb-3 text-base font-semibold text-[#252323]">
                  {formatDate(date)}
                </h3>
                <div className="space-y-2">
                  {itineraryByDate[date].map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[5px] border border-[#DAD2BC] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                    >
                      <div className="flex items-start gap-3">
                        {item.time && (
                          <span className="mt-0.5 text-sm font-medium text-[#70798C]">
                            {item.time}
                          </span>
                        )}
                        <div>
                          <p className="font-medium text-[#252323]">{item.title}</p>
                          {item.location && (
                            <p className="mt-0.5 text-sm text-[#A99985]">{item.location}</p>
                          )}
                          {item.description && (
                            <p className="mt-1 text-sm text-[#A99985]">{item.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="mb-3 text-2xl font-bold text-[#252323]">Ready to join?</h2>
          <p className="mb-6 text-[#A99985]">
            Sign up or log in to join this trip and start collaborating with the group.
          </p>
          <button
            onClick={() => router.push(`/login?next=/invite/${inviteCode}`)}
            className="rounded-[5px] bg-[#70798C] px-8 py-3 text-base font-medium text-white hover:bg-[#5A6270] transition-colors"
          >
            Join This Trip
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 text-center">
        <p className="text-xs text-[#A99985]">Powered by GroupTrip</p>
      </div>
    </div>
  )
}
