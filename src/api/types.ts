import type { z } from 'zod'
import type {
  bookingRequestSchema,
  bookingSchema,
  fareClassSchema,
  fareSchema,
  passengerSchema,
  stationSchema,
  tripSchema,
} from './schemas'

// Les types sont déduits des schémas : une seule source de vérité.
export type Station = z.infer<typeof stationSchema>
export type FareClass = z.infer<typeof fareClassSchema>
export type Fare = z.infer<typeof fareSchema>
export type Trip = z.infer<typeof tripSchema>
export type Passenger = z.infer<typeof passengerSchema>
export type BookingRequest = z.infer<typeof bookingRequestSchema>
export type Booking = z.infer<typeof bookingSchema>

export type TripSearchParams = {
  from: string
  to: string
  /** Date au format AAAA-MM-JJ */
  date: string
  passengers: number
}
