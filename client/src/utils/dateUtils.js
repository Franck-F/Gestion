import { format, formatDistanceToNow, isToday, isTomorrow, isPast, differenceInDays } from 'date-fns'
import { fr } from 'date-fns/locale'

export function formatDate(date) {
  return format(new Date(date), 'dd MMM yyyy', { locale: fr })
}

export function formatDateTime(date) {
  return format(new Date(date), 'dd MMM yyyy à HH:mm', { locale: fr })
}

export function formatRelative(date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr })
}

export function formatDeadline(date) {
  const d = new Date(date)
  if (isToday(d)) return "Aujourd'hui"
  if (isTomorrow(d)) return 'Demain'
  const days = differenceInDays(d, new Date())
  if (days < 0) return `En retard (${formatDate(date)})`
  if (days <= 7) return `Dans ${days} jours`
  return formatDate(date)
}

export function isOverdue(date) {
  return isPast(new Date(date))
}

export function toInputDate(date) {
  if (!date) return ''
  return format(new Date(date), 'yyyy-MM-dd')
}

export function toInputDateTime(date) {
  if (!date) return ''
  return format(new Date(date), "yyyy-MM-dd'T'HH:mm")
}
