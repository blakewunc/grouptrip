'use client'

interface ItineraryDay {
  date: string
  items: Array<{ id: string; title: string; time: string | null; location: string | null }>
}

interface ItineraryPreviewCardProps {
  days: ItineraryDay[]
  onViewFull: () => void
  onAddActivity: () => void
}

export function ItineraryPreviewCard({ days, onViewFull, onAddActivity }: ItineraryPreviewCardProps) {
  // Show next 2 days, max 4 items total
  const previewDays = days.slice(0, 2)
  let itemCount = 0

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="rounded-[8px] border border-[#DAD2BC] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#252323]">Itinerary</h3>
        {days.length > 0 && (
          <button className="text-[#A99985] hover:text-[#252323] transition-colors">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        )}
      </div>

      {days.length === 0 ? (
        <div className="py-6 text-center">
          <p className="mb-3 text-sm text-[#A99985]">No activities yet</p>
          <button
            onClick={onAddActivity}
            className="inline-flex items-center gap-1.5 rounded-[5px] border border-[#DAD2BC] px-4 py-2 text-sm font-medium text-[#252323] transition-colors hover:bg-[#F5F1ED]"
          >
            Add your first activity
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {previewDays.map((day) => {
              if (itemCount >= 4) return null
              return (
                <div key={day.date}>
                  <p className="mb-2 text-sm font-medium text-[#A99985]">{formatDate(day.date)}</p>
                  <div className="space-y-2">
                    {day.items.map((item) => {
                      if (itemCount >= 4) return null
                      itemCount++
                      return (
                        <div key={item.id} className="flex items-start gap-2.5">
                          <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#4A7C59]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-[#252323]">{item.title}</p>
                            {(item.time || item.location) && (
                              <p className="text-xs text-[#A99985]">
                                {item.location && `${item.location}`}
                                {item.location && item.time && ' \u2014 '}
                                {item.time && item.time}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          <button
            onClick={onViewFull}
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#70798C] transition-colors hover:text-[#252323]"
          >
            View Full Itinerary
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}
