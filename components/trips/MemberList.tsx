'use client'

import { toast } from 'sonner'

interface Profile {
  id: string
  email: string
  full_name: string | null
}

interface TripMember {
  id: string
  role: string
  rsvp_status: string
  created_at: string
  profiles: Profile
}

interface MemberListProps {
  members: TripMember[]
  inviteCode: string
}

export function MemberList({ members, inviteCode }: MemberListProps) {
  const copyInviteLink = () => {
    const link = `${window.location.origin}/invite/${inviteCode}`
    navigator.clipboard.writeText(link)
    toast.success('Invite link copied to clipboard!')
  }

  const getRsvpBadgeColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-50 text-green-700'
      case 'declined':
        return 'bg-red-50 text-red-700'
      case 'pending':
        return 'bg-yellow-50 text-yellow-700'
      default:
        return 'bg-[#F5F1ED] text-[#A99985]'
    }
  }

  const getRoleBadgeColor = (role: string) => {
    return role === 'organizer'
      ? 'bg-purple-50 text-purple-700'
      : 'bg-blue-50 text-blue-700'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#252323]">Trip Members</h3>
          <p className="text-sm text-[#A99985]">
            {members.length} {members.length === 1 ? 'person' : 'people'} in this trip
          </p>
        </div>
        <button
          onClick={copyInviteLink}
          className="rounded-[5px] border border-[#DAD2BC] bg-white px-4 py-2 text-sm font-medium text-[#252323] hover:bg-[#F5F1ED] transition-colors"
        >
          Copy Invite Link
        </button>
      </div>

      <div className="space-y-2">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-[5px] border border-[#DAD2BC] bg-white p-4"
          >
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#70798C]">
                <span className="text-sm font-semibold text-white">
                  {(member.profiles.full_name || member.profiles.email).charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-[#252323]">
                  {member.profiles.full_name || member.profiles.email}
                </p>
                {member.profiles.full_name && (
                  <p className="text-sm text-[#A99985]">{member.profiles.email}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeColor(
                  member.role
                )}`}
              >
                {member.role}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRsvpBadgeColor(
                  member.rsvp_status
                )}`}
              >
                {member.rsvp_status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {members.length === 0 && (
        <div className="rounded-[5px] border border-dashed border-[#DAD2BC] p-8 text-center">
          <p className="text-sm text-[#A99985]">No members yet. Share the invite link to get started!</p>
        </div>
      )}
    </div>
  )
}
