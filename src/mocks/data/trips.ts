import type { Fare, Trip } from '../../api/types'
import { routes } from './stations'

const DEPARTURES = ['06:30', '08:15', '10:45', '13:10', '16:40', '18:55', '20:30']
const HUB = 'PMO'

/** Durée du trajet si la ligne existe (dans un sens ou dans l'autre), sinon null. */
export function routeDuration(from: string, to: string): number | null {
  if (from === HUB) return routes[to] ?? null
  if (to === HUB) return routes[from] ?? null
  return null
}

// Pseudo-aléatoire déterministe : mêmes paramètres, mêmes résultats (utile pour les tests).
function seeded(input: string): number {
  let hash = 0
  for (const char of input) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return (hash % 1000) / 1000
}

function buildFares(id: string, time: string): Fare[] {
  const hour = Number(time.slice(0, 2))
  const isPeak = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)
  const random = seeded(id)
  const base = 2900 + Math.round(random * 4000) + (isPeak ? 2500 : 0)
  // Le premier train de pointe du matin est complet en Standard : un cas limite à gérer.
  const standardSeats = time === '08:15' ? 0 : Math.round(random * 120) + 3
  return [
    { fareClass: 'standard', priceCents: base, seatsLeft: standardSeats },
    { fareClass: 'first', priceCents: Math.round(base * 1.6), seatsLeft: Math.round(random * 30) + 1 },
  ]
}

export function buildTripId(from: string, to: string, date: string, time: string) {
  return [from, to, date, time.replace(':', '')].join('_')
}

export function generateTrip(from: string, to: string, date: string, time: string): Trip | null {
  const duration = routeDuration(from, to)
  if (duration === null) return null

  const departure = new Date(`${date}T${time}:00`)
  if (Number.isNaN(departure.getTime())) return null
  const arrival = new Date(departure.getTime() + duration * 60_000)
  const id = buildTripId(from, to, date, time)

  return {
    id,
    trainNumber: `VV ${8000 + Math.round(seeded(id) * 999)}`,
    originId: from,
    destinationId: to,
    departureAt: departure.toISOString(),
    arrivalAt: arrival.toISOString(),
    durationMinutes: duration,
    fares: buildFares(id, time),
  }
}

export function generateTrips(from: string, to: string, date: string): Trip[] {
  return DEPARTURES.map((time) => generateTrip(from, to, date, time)).filter(
    (trip): trip is Trip => trip !== null,
  )
}

export function findTripById(id: string): Trip | null {
  const [from, to, date, hhmm] = id.split('_')
  if (!from || !to || !date || !hhmm || hhmm.length !== 4) return null
  return generateTrip(from, to, date, `${hhmm.slice(0, 2)}:${hhmm.slice(2)}`)
}
