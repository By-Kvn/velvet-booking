/** Formats d'affichage : toujours en français et à l'heure de Paris, quel que soit le fuseau du voyageur. */
const TIME_ZONE = 'Europe/Paris'

const priceFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
const timeFormatter = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: TIME_ZONE })
const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: TIME_ZONE,
})
// en-CA produit directement le format AAAA-MM-JJ attendu par <input type="date">.
const isoDateFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE })

export function formatPrice(cents: number): string {
  return priceFormatter.format(cents / 100)
}

/** « 08:15 » */
export function formatTime(isoDateTime: string): string {
  return timeFormatter.format(new Date(isoDateTime))
}

/** « 2 h 10 », « 2 h », « 45 min » */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} min`
  if (rest === 0) return `${hours} h`
  return `${hours} h ${String(rest).padStart(2, '0')}`
}

/** « vendredi 12 juin 2030 » à partir de « 2030-06-12 » */
export function formatDate(isoDate: string): string {
  // Midi UTC : la date reste la même quel que soit le décalage horaire.
  return dateFormatter.format(new Date(`${isoDate}T12:00:00Z`))
}

/** Date du jour à Paris, au format AAAA-MM-JJ. */
export function todayInParis(now: Date = new Date()): string {
  return isoDateFormatter.format(now)
}

/** Jour de départ à Paris (AAAA-MM-JJ) d'un horaire ISO : un 23h30 UTC est déjà le lendemain à Paris. */
export function parisDateOf(isoDateTime: string): string {
  return isoDateFormatter.format(new Date(isoDateTime))
}

export function formatPassengers(count: number): string {
  return count > 1 ? `${count} voyageurs` : '1 voyageur'
}
