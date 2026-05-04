import { formatDistanceToNow, format, isPast } from 'date-fns'

export function formatTimeLeft(expiresAt) {
  if (!expiresAt) return 'Unknown'
  const date = new Date(expiresAt)
  if (isPast(date)) return 'Expired'
  return formatDistanceToNow(date, { addSuffix: true })
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  return format(new Date(dateStr), 'PPp')
}

export function formatDistance(km) {
  if (km == null) return ''
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
}

export function getUrgency(expiresAt) {
  const diff = new Date(expiresAt) - new Date()
  if (diff <= 0) return 'expired'
  if (diff < 30 * 60_000) return 'red'
  if (diff < 120 * 60_000) return 'yellow'
  return 'green'
}
