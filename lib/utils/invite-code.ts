import { nanoid } from 'nanoid'

/**
 * Generate a unique, URL-safe invite code
 * Uses nanoid for cryptographically strong random IDs
 */
export function generateInviteCode(): string {
  // Generate 12-character URL-safe code
  return nanoid(12)
}

/**
 * Validate invite code format
 */
export function isValidInviteCode(code: string): boolean {
  // Check if code is 12 characters and URL-safe
  return /^[A-Za-z0-9_-]{12}$/.test(code)
}
