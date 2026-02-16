'use client'

import { toast } from 'sonner'

interface Member {
  id: string
  role: string
  rsvp_status: string
  profiles: {
    id: string
    email: string
    display_name: string | null
  }
}

interface TripMembersCardProps {
  members: Member[]
  inviteCode: string
  onInviteMore: () => void
}

export function TripMembersCard({ members, inviteCode, onInviteMore }: TripMembersCardProps) {
  const copyInviteLink = () => {
    const link = `${window.location.origin}/invite/${inviteCode}`
    navigator.clipboard.writeText(link)
    toast.success('Invite link copied!')
  }

  const getRsvpLabel = (status: string) => {
    switch (status) {
      case 'accepted': return { text: 'Going', color: 'text-[#4A7C59]' }
      case 'declined': return { text: 'Not going', color: 'text-[#8B4444]' }
      case 'maybe': return { text: 'Maybe', color: 'text-[#B8956A]' }
      default: return { text: 'Not responded', color: 'text-[#A99985]' }
    }
  }

  const getInitialBg = (index: number) => {
    const colors = ['bg-[#70798C]', 'bg-[#A99985]', 'bg-[#8B7355]', 'bg-[#6B8E7B]', 'bg-[#7C6B8E]']
    return colors[index % colors.length]
  }

  return (
    <div className="rounded-[8px] border border-[#DAD2BC] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#252323]">Trip Members</h3>
        <button
          onClick={copyInviteLink}
          className="text-sm font-medium text-[#70798C] transition-colors hover:text-[#252323]"
        >
          Invite More
        </button>
      </div>

      {members.length === 0 ? (
        <div className="py-4 text-center">
          <p className="mb-3 text-sm text-[#A99985]">Invite friends to start planning together</p>
          <button
            onClick={onInviteMore}
            className="inline-flex items-center gap-1.5 rounded-[5px] border border-[#DAD2BC] px-4 py-2 text-sm font-medium text-[#252323] transition-colors hover:bg-[#F5F1ED]"
          >
            Send Invite
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {members.map((member, i) => {
              const name = member.profiles.display_name || member.profiles.email.split('@')[0]
              const rsvp = getRsvpLabel(member.rsvp_status)

              return (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full ${getInitialBg(i)}`}>
                      <span className="text-xs font-semibold text-white">
                        {name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#252323]">{name}</span>
                      {member.role === 'organizer' && (
                        <span className="rounded-[4px] bg-[#F5F1ED] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#A99985]">
                          Organizer
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      member.rsvp_status === 'accepted' ? 'bg-[#4A7C59]' :
                      member.rsvp_status === 'declined' ? 'bg-[#8B4444]' :
                      member.rsvp_status === 'maybe' ? 'bg-[#B8956A]' : 'bg-[#DAD2BC]'
                    }`} />
                    <span className={`text-xs font-medium ${rsvp.color}`}>{rsvp.text}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Invite More CTA */}
          <button
            onClick={onInviteMore}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-[5px] border border-dashed border-[#DAD2BC] py-2.5 text-sm font-medium text-[#A99985] transition-colors hover:border-[#70798C] hover:text-[#252323]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Invite More
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}
