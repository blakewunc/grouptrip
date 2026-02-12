// Form validation utilities

export function validateEmail(email: string): string | null {
  if (!email) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Please enter a valid email address'
  }
  return null
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`
  }
  return null
}

export function validateDate(date: string, fieldName: string): string | null {
  if (!date) return `${fieldName} is required`
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) {
    return 'Please enter a valid date'
  }
  return null
}

export function validateDateRange(startDate: string, endDate: string): string | null {
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 'Please enter valid dates'
  }

  if (end < start) {
    return 'End date must be after start date'
  }

  return null
}

export function validateNumber(value: string, fieldName: string, min?: number, max?: number): string | null {
  if (!value) return `${fieldName} is required`

  const num = parseFloat(value)
  if (isNaN(num)) {
    return `${fieldName} must be a valid number`
  }

  if (min !== undefined && num < min) {
    return `${fieldName} must be at least ${min}`
  }

  if (max !== undefined && num > max) {
    return `${fieldName} must be at most ${max}`
  }

  return null
}

export function validateLength(value: string, fieldName: string, min?: number, max?: number): string | null {
  if (!value) return `${fieldName} is required`

  const length = value.trim().length

  if (min !== undefined && length < min) {
    return `${fieldName} must be at least ${min} characters`
  }

  if (max !== undefined && length > max) {
    return `${fieldName} must be at most ${max} characters`
  }

  return null
}
