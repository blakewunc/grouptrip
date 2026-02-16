'use client'

interface TripProgressCardProps {
  membersRespondedCount: number
  membersTotalCount: number
  budgetCategoriesCount: number
  activitiesPlannedCount: number
  availabilitySubmittedCount: number
  onViewItinerary: () => void
}

export function TripProgressCard({
  membersRespondedCount,
  membersTotalCount,
  budgetCategoriesCount,
  activitiesPlannedCount,
  availabilitySubmittedCount,
  onViewItinerary,
}: TripProgressCardProps) {
  // Compute % planned
  const rsvpPercent = membersTotalCount > 0 ? Math.min(1, membersRespondedCount / membersTotalCount) : 0
  const budgetPercent = budgetCategoriesCount >= 1 ? 1 : 0
  const activitiesPercent = activitiesPlannedCount >= 1 ? 1 : 0
  const availabilityPercent = availabilitySubmittedCount >= 1 ? 1 : 0
  const totalPercent = Math.round(((rsvpPercent + budgetPercent + activitiesPercent + availabilityPercent) / 4) * 100)

  const checklist = [
    {
      label: `${membersRespondedCount}/${membersTotalCount} members responded`,
      done: rsvpPercent >= 1,
      partial: rsvpPercent > 0 && rsvpPercent < 1,
    },
    {
      label: `${budgetCategoriesCount} budget ${budgetCategoriesCount === 1 ? 'category' : 'categories'} added`,
      done: budgetPercent === 1,
      partial: false,
    },
    {
      label: `${activitiesPlannedCount} ${activitiesPlannedCount === 1 ? 'activity' : 'activities'} planned`,
      done: activitiesPercent === 1,
      partial: false,
    },
    {
      label: availabilitySubmittedCount > 0
        ? `Availability submitted`
        : 'Availability not finalized',
      done: availabilityPercent === 1,
      partial: false,
    },
  ]

  const allZero = membersRespondedCount === 0 && budgetCategoriesCount === 0 && activitiesPlannedCount === 0 && availabilitySubmittedCount === 0

  return (
    <div className="rounded-[8px] border border-[#DAD2BC] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <h3 className="mb-4 text-lg font-semibold text-[#252323]">Trip Progress</h3>

      {/* Progress bar */}
      <div className="mb-1 flex items-center justify-between">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#F5F1ED]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#4A7C59] to-[#5A8F6A] transition-all duration-500"
            style={{ width: `${totalPercent}%` }}
          />
        </div>
        <span className="ml-3 text-sm font-semibold text-[#4A7C59]">{totalPercent}% planned</span>
      </div>

      {/* Checklist */}
      <div className="mt-4 space-y-2.5">
        {checklist.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5">
            {item.done ? (
              <svg className="h-5 w-5 shrink-0 text-[#4A7C59]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : item.partial ? (
              <svg className="h-5 w-5 shrink-0 text-[#B8956A]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#DAD2BC]">
                <svg className="h-3 w-3 text-[#DAD2BC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
            <span className={`text-sm ${item.done ? 'text-[#252323]' : 'text-[#A99985]'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {allZero && (
        <p className="mt-4 text-sm text-[#A99985]">
          Start by inviting members or adding your first activity.
        </p>
      )}

      <button
        onClick={onViewItinerary}
        className="mt-5 inline-flex items-center gap-1.5 rounded-[5px] border border-[#DAD2BC] px-4 py-2 text-sm font-medium text-[#252323] transition-colors hover:bg-[#F5F1ED]"
      >
        View Full Itinerary
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
