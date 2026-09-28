import { z } from 'zod'
import { request } from './client'
import { stationSchema, tripSchema } from './schemas'
import type { TripSearchParams } from './types'

export function getStations(signal?: AbortSignal) {
  return request('/stations', z.array(stationSchema), { signal })
}

export function searchTrips({ from, to, date, passengers }: TripSearchParams, signal?: AbortSignal) {
  const query = new URLSearchParams({ from, to, date, passengers: String(passengers) })
  return request(`/trips?${query}`, z.array(tripSchema), { signal })
}

export function getTrip(id: string, signal?: AbortSignal) {
  return request(`/trips/${encodeURIComponent(id)}`, tripSchema, { signal })
}
