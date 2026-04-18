import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options })
}

export function formatRelativeTime(date) {
  const now = new Date()
  const target = new Date(date)
  const diffInSeconds = Math.floor((target - now) / 1000)
  const absDiff = Math.abs(diffInSeconds)
  
  if (absDiff < 60) {
    return diffInSeconds > 0 ? 'in a few seconds' : 'just now'
  }
  
  const minutes = Math.floor(absDiff / 60)
  if (minutes < 60) {
    return diffInSeconds > 0 
      ? `in ${minutes} minute${minutes > 1 ? 's' : ''}`
      : `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  }
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return diffInSeconds > 0 
      ? `in ${hours} hour${hours > 1 ? 's' : ''}`
      : `${hours} hour${hours > 1 ? 's' : ''} ago`
  }
  
  const days = Math.floor(hours / 24)
  if (days < 30) {
    return diffInSeconds > 0 
      ? `in ${days} day${days > 1 ? 's' : ''}`
      : `${days} day${days > 1 ? 's' : ''} ago`
  }
  
  const months = Math.floor(days / 30)
  if (months < 12) {
    return diffInSeconds > 0 
      ? `in ${months} month${months > 1 ? 's' : ''}`
      : `${months} month${months > 1 ? 's' : ''} ago`
  }
  
  const years = Math.floor(months / 12)
  return diffInSeconds > 0 
    ? `in ${years} year${years > 1 ? 's' : ''}`
    : `${years} year${years > 1 ? 's' : ''} ago`
}

export function formatTimeRemaining(milliseconds) {
  if (milliseconds <= 0) return 'Expired'

  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`
  return `${seconds} second${seconds !== 1 ? 's' : ''}`
}

export function getTimeUntilUnlock(unlockDate) {
  const now = new Date()
  const target = new Date(unlockDate)
  const diff = target - now
  
  if (diff <= 0) return { canUnlock: true, text: 'Ready to unlock' }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  let text = ''
  if (days > 0) text += `${days}d `
  if (hours > 0) text += `${hours}h `
  if (minutes > 0 && days === 0) text += `${minutes}m`
  
  return { canUnlock: false, text: text.trim() || 'Less than a minute' }
}

export function getAutoExpireInfo(capsule) {
  if (!capsule || capsule.rule !== 'auto_expire' || !capsule.expiresAfter || !capsule.createdAt) {
    return null
  }

  const createdAt = new Date(capsule.createdAt)
  const expiresAt = new Date(createdAt.getTime() + capsule.expiresAfter * 24 * 60 * 60 * 1000)
  const remainingMs = expiresAt.getTime() - new Date().getTime()

  return {
    expiresAt,
    remainingMs,
    text: formatTimeRemaining(remainingMs),
  }
}

export function getStatusColor(status) {
  const colors = {
    locked: 'neon-cyan',
    unlocked: 'neon-purple',
    expired: 'muted',
    destroyed: 'destructive',
  }
  return colors[status] || 'muted'
}

export function getStatusIcon(status) {
  const icons = {
    locked: 'Lock',
    unlocked: 'Unlock',
    expired: 'Clock',
    destroyed: 'Flame',
  }
  return icons[status] || 'Circle'
}

export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function validatePassword(password) {
  return password.length >= 6
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}
