import { z } from 'zod'

/**
 * Contrat d'API Velvet.
 * Les réponses du backend sont validées à l'exécution avec Zod :
 * si le contrat casse côté serveur, on le détecte immédiatement
 * au lieu de propager des données corrompues dans l'interface.
 */

export const stationSchema = z.object({
  id: z.string(),
  name: z.string(),
  city: z.string(),
})

export const fareClassSchema = z.enum(['standard', 'first'])

export const fareSchema = z.object({
  fareClass: fareClassSchema,
  priceCents: z.number().int().nonnegative(),
  seatsLeft: z.number().int().nonnegative(),
})

export const tripSchema = z.object({
  id: z.string(),
  trainNumber: z.string(),
  originId: z.string(),
  destinationId: z.string(),
  departureAt: z.iso.datetime({ offset: true }),
  arrivalAt: z.iso.datetime({ offset: true }),
  durationMinutes: z.number().int().positive(),
  fares: z.array(fareSchema).min(1),
})

export const passengerSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
})

export const bookingRequestSchema = z.object({
  tripId: z.string(),
  fareClass: fareClassSchema,
  passengers: z.array(passengerSchema).min(1).max(9),
  email: z.email(),
})

export const bookingSchema = z.object({
  id: z.string(),
  reference: z.string().length(6),
  trip: tripSchema,
  fareClass: fareClassSchema,
  passengers: z.array(passengerSchema),
  email: z.email(),
  totalCents: z.number().int().nonnegative(),
  createdAt: z.iso.datetime({ offset: true }),
})

export const apiErrorBodySchema = z.object({
  code: z.string(),
  message: z.string(),
})
