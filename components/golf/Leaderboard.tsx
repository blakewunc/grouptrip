'use client'

import { useEffect, useState } from 'react'

interface LeaderboardProps {
  tripId: string
}

interface Score {
  user_id: string
  user_name: string
  score: number
  handicap: number | null
  tee_time_id: string
  course_name: string
}

export function Leaderboard({ tripId }: LeaderboardProps) {
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchScores() {
      try {
        const response = await fetch(`/api/trips/${tripId}/golf/scores`)
        if (response.ok) {
          const data = await response.json()
          setScores(data.scores || [])
        }
      } catch (error) {
        console.error('Failed to fetch scores:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchScores()
  }, [tripId])

  if (loading) {
    return <p className="text-sm text-[#A99985]">Loading scores...</p>
  }

  if (scores.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-[#A99985]">No scores recorded yet</p>
        <p className="text-xs text-[#A99985] mt-2">
          Scores will appear here after rounds are completed
        </p>
      </div>
    )
  }

  // Sort scores by lowest score
  const sortedScores = [...scores].sort((a, b) => a.score - b.score)

  return (
    <div className="space-y-3">
      {sortedScores.map((score, index) => (
        <div
          key={`${score.user_id}-${score.tee_time_id}`}
          className="flex items-center justify-between rounded-[5px] border border-[#DAD2BC] bg-white p-3"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F1ED] text-sm font-semibold text-[#252323]">
              {index + 1}
            </div>
            <div>
              <p className="font-medium text-[#252323]">{score.user_name}</p>
              <p className="text-xs text-[#A99985]">{score.course_name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-[#252323]">{score.score}</p>
            {score.handicap !== null && (
              <p className="text-xs text-[#A99985]">HCP: {score.handicap}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
