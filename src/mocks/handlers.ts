import { delay, http, HttpResponse } from 'msw'
import { bookingRequestSchema } from '../api/schemas'
import type { Booking } from '../api/types'
import { stations } from './data/stations'
import { findTripById, generateTrips } from './data/trips'
import { getScenario } from './scenario'

function errorResponse(status: number, code: string, message: string) {
  return HttpResponse.json({ code, message }, { status })
}

/**
 * Applique le scénario actif avant chaque réponse.
 * Renvoie une réponse d'erreur si le scénario l'impose, sinon null.
 */
async function applyScenario(): Promise<Response | null> {
  switch (getScenario()) {
    case 'slow':
      await delay(3000)
      return null
    case 'timeout':
      await delay(20_000)
      return null
    case 'error':
      await delay()
      return errorResponse(500, 'SERVER', 'Internal server error')
    case 'network':
      return HttpResponse.error()
    default:
      await delay()
      return null
  }
}

function generateReference(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sans O/0 ni I/1, pour éviter les confusions
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
}

export const handlers = [
  http.get('/api/stations', async () => {
    const override = await applyScenario()
    if (override) return override
    if (getScenario() === 'invalid-contract') {
      return HttpResponse.json([{ id: 42, label: 'Paris' }])
    }
    return HttpResponse.json(stations)
  }),

  http.get('/api/trips', async ({ request }) => {
    const override = await applyScenario()
    if (override) return override

    const url = new URL(request.url)
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')
    const date = url.searchParams.get('date')
    if (!from || !to || !date) {
      return errorResponse(422, 'VALIDATION', 'Paramètres from, to et date requis')
    }

    let trips = generateTrips(from, to, date)
    if (getScenario() === 'sold-out') {
      trips = trips.map((trip) => ({
        ...trip,
        fares: trip.fares.map((fare) => ({ ...fare, seatsLeft: 0 })),
      }))
    }
    if (getScenario() === 'invalid-contract') {
      return HttpResponse.json(trips.map(({ fares: _fares, ...rest }) => rest))
    }
    return HttpResponse.json(trips)
  }),

  http.get('/api/trips/:id', async ({ params }) => {
    const override = await applyScenario()
    if (override) return override

    const trip = findTripById(String(params.id))
    if (!trip) return errorResponse(404, 'NOT_FOUND', 'Trajet introuvable')
    return HttpResponse.json(trip)
  }),

  http.post('/api/bookings', async ({ request }) => {
    const override = await applyScenario()
    if (override) return override

    const parsed = bookingRequestSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return errorResponse(422, 'VALIDATION', 'Réservation invalide')

    const { tripId, fareClass, passengers, email } = parsed.data
    const trip = findTripById(tripId)
    if (!trip) return errorResponse(404, 'NOT_FOUND', 'Trajet introuvable')

    const fare = trip.fares.find((f) => f.fareClass === fareClass)
    const seatsLeft = getScenario() === 'sold-out' ? 0 : (fare?.seatsLeft ?? 0)
    if (!fare || seatsLeft < passengers.length) {
      return errorResponse(409, 'SOLD_OUT', 'Plus assez de places dans cette classe')
    }

    const booking: Booking = {
      id: crypto.randomUUID(),
      reference: generateReference(),
      trip,
      fareClass,
      passengers,
      email,
      totalCents: fare.priceCents * passengers.length,
      createdAt: new Date().toISOString(),
    }
    return HttpResponse.json(booking, { status: 201 })
  }),
]
