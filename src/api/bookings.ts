import { request } from './client'
import { bookingSchema } from './schemas'
import type { BookingRequest } from './types'

export function createBooking(input: BookingRequest) {
  // Pas de signal d'annulation : un achat lancé doit aller au bout.
  return request('/bookings', bookingSchema, { method: 'POST', body: input, timeoutMs: 15000 })
}
