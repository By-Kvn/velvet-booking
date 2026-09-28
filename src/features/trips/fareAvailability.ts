import type { Fare } from '../../api/types'

/** Seuil sous lequel on prévient le voyageur qu'il reste peu de places. */
export const LOW_SEATS_THRESHOLD = 10

export type FareAvailability =
  | { status: 'sold-out' }
  | { status: 'not-enough'; seatsLeft: number }
  | { status: 'low'; seatsLeft: number }
  | { status: 'available' }

/** Règle métier isolée du rendu : testable sans composant. */
export function getFareAvailability(fare: Fare, passengers: number): FareAvailability {
  if (fare.seatsLeft === 0) return { status: 'sold-out' }
  if (fare.seatsLeft < passengers) return { status: 'not-enough', seatsLeft: fare.seatsLeft }
  if (fare.seatsLeft <= LOW_SEATS_THRESHOLD) return { status: 'low', seatsLeft: fare.seatsLeft }
  return { status: 'available' }
}

export const FARE_CLASS_LABELS = {
  standard: 'Standard',
  first: 'Première',
} as const
