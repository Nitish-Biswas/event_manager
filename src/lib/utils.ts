import { clsx, type ClassValue } from 'clsx'

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

/**
 * Format date for event cards
 */
export function formatEventDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

/**
 * Get RSVP status styling
 */
export function getRSVPStatusStyles(status: 'Yes' | 'No' | 'Maybe') {
  switch (status) {
    case 'Yes':
      return 'bg-success-50 text-success-600 border-success-200'
    case 'No':
      return 'bg-danger-50 text-danger-600 border-danger-200'
    case 'Maybe':
      return 'bg-warning-50 text-warning-600 border-warning-200'
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200'
  }
}