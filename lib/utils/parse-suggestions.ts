export interface ItinerarySuggestion {
  title: string
  date: string
  time?: string
  location?: string
  description?: string
}

type Segment =
  | { type: 'text'; content: string }
  | { type: 'suggestion'; data: ItinerarySuggestion }

export function parseSuggestions(text: string): Segment[] {
  const segments: Segment[] = []
  const regex = /\[SUGGESTION\]([\s\S]*?)\[\/SUGGESTION\]/g

  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) })
    }

    try {
      const data = JSON.parse(match[1]) as ItinerarySuggestion
      segments.push({ type: 'suggestion', data })
    } catch {
      segments.push({ type: 'text', content: match[0] })
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) })
  }

  return segments
}
