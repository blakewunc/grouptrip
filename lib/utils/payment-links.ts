/**
 * Generate deep links to payment apps with pre-filled amount and note
 */

export type PaymentApp = 'venmo' | 'zelle' | 'cashapp'

export interface PaymentLinkOptions {
  app: PaymentApp
  handle: string
  amount: number
  note?: string
}

/**
 * Generate a payment deep link for the specified app
 *
 * @param options - Payment link configuration
 * @returns Deep link URL or null if not supported
 */
export function generatePaymentLink(options: PaymentLinkOptions): string | null {
  const { app, handle, amount, note } = options

  // Clean handle (remove @ or $ prefix if present)
  const cleanHandle = handle.replace(/^[@$]/, '')

  switch (app) {
    case 'venmo':
      // Venmo deep link format: venmo://paycharge?txn=pay&recipients=username&amount=50.00&note=Trip%20settlement
      const venmoNote = encodeURIComponent(note || 'Trip settlement')
      return `venmo://paycharge?txn=pay&recipients=${cleanHandle}&amount=${amount.toFixed(2)}&note=${venmoNote}`

    case 'cashapp':
      // Cash App deep link format: https://cash.app/$username/50.00
      // Note: Cash App doesn't support pre-filled notes via deep link
      return `https://cash.app/$${cleanHandle}/${amount.toFixed(2)}`

    case 'zelle':
      // Zelle doesn't have a universal deep link
      // Return null to indicate manual payment is needed
      return null

    default:
      return null
  }
}

/**
 * Check if a payment app supports deep links
 */
export function supportsDeepLink(app: PaymentApp): boolean {
  return app === 'venmo' || app === 'cashapp'
}

/**
 * Get display name for payment app
 */
export function getPaymentAppName(app: PaymentApp): string {
  const names: Record<PaymentApp, string> = {
    venmo: 'Venmo',
    zelle: 'Zelle',
    cashapp: 'Cash App',
  }
  return names[app]
}

/**
 * Get button color for payment app
 */
export function getPaymentAppColor(app: PaymentApp): string {
  const colors: Record<PaymentApp, string> = {
    venmo: 'bg-[#3D95CE] hover:bg-[#2D85BE] text-white',
    zelle: 'bg-[#6D1ED4] hover:bg-[#5D0EC4] text-white',
    cashapp: 'bg-[#00D632] hover:bg-[#00C62C] text-white',
  }
  return colors[app]
}
