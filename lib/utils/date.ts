import { format, formatDistance, formatDistanceToNow, parseISO } from 'date-fns'

/**
 * Format date to readable string
 * @param date - Date string or Date object
 * @param formatString - Format pattern (default: 'MMM d, yyyy')
 */
export function formatDate(date: string | Date, formatString: string = 'MMM d, yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatString)
}

/**
 * Format date range
 * @param startDate - Start date
 * @param endDate - End date
 */
export function formatDateRange(startDate: string | Date, endDate: string | Date): string {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate

  return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(dateObj, { addSuffix: true })
}

/**
 * Get number of days between two dates
 */
export function getDaysBetween(startDate: string | Date, endDate: string | Date): number {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate

  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
