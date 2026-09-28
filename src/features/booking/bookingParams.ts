import { z } from 'zod'
import { fareClassSchema } from '../../api/schemas'
import type { FareClass } from '../../api/types'
import { MAX_PASSENGERS } from '../search/searchCriteria'

const paramsSchema = z.object({
  class: fareClassSchema.catch('standard'),
  passengers: z.coerce.number().int().min(1).max(MAX_PASSENGERS).catch(1),
})

/** Paramètres de /reservation/:tripId?class=first&passengers=2, avec repli sûr si l'URL est bricolée. */
export function parseBookingParams(params: URLSearchParams): { fareClass: FareClass; passengers: number } {
  const parsed = paramsSchema.parse({ class: params.get('class') ?? undefined, passengers: params.get('passengers') ?? undefined })
  return { fareClass: parsed.class, passengers: parsed.passengers }
}
