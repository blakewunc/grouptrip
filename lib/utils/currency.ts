/**
 * Format number as currency (USD)
 * @param amount - Amount in dollars
 * @param showCents - Whether to show cents (default: true)
 */
export function formatCurrency(amount: number, showCents: boolean = true): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(amount)
}

/**
 * Parse currency string to number
 * @param currencyString - String like "$1,234.56"
 */
export function parseCurrency(currencyString: string): number {
  const cleaned = currencyString.replace(/[$,]/g, '')
  return parseFloat(cleaned)
}

/**
 * Calculate percentage
 * @param part - Part value
 * @param total - Total value
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0
  return Math.round((part / total) * 100)
}

/**
 * Round to 2 decimal places (for money)
 */
export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100
}
