import { z } from 'zod'
import type { TripSearchParams } from '../../api/types'

export const MAX_PASSENGERS = 9

/**
 * L'URL est la source de vérité de la recherche : /trajets?from=PMO&to=NTE&date=2030-06-12&passengers=2
 * Un lien partagé ou le bouton retour redonnent exactement les mêmes résultats.
 * Comme toute donnée externe, l'URL est validée avant usage.
 */
const criteriaSchema = z
  .object({
    from: z.string().min(1),
    to: z.string().min(1),
    date: z.iso.date(),
    passengers: z.coerce.number().int().min(1).max(MAX_PASSENGERS),
  })
  .refine((criteria) => criteria.from !== criteria.to)

export type SearchCriteria = TripSearchParams

export type ParsedCriteria =
  | { status: 'valid'; criteria: SearchCriteria }
  | { status: 'invalid' }
  | { status: 'past'; criteria: SearchCriteria }

export function parseSearchCriteria(params: URLSearchParams, today: string): ParsedCriteria {
  const parsed = criteriaSchema.safeParse(Object.fromEntries(params))
  if (!parsed.success) return { status: 'invalid' }
  // Comparaison de chaînes AAAA-MM-JJ : l'ordre alphabétique est l'ordre chronologique.
  if (parsed.data.date < today) return { status: 'past', criteria: parsed.data }
  return { status: 'valid', criteria: parsed.data }
}

export function toSearchParams({ from, to, date, passengers }: SearchCriteria): URLSearchParams {
  return new URLSearchParams({ from, to, date, passengers: String(passengers) })
}

/** Valeurs partielles pour préremplir le formulaire depuis l'URL (« Modifier la recherche »). */
export function readSearchDefaults(params: URLSearchParams): Partial<Record<keyof SearchCriteria, string>> {
  const defaults: Partial<Record<keyof SearchCriteria, string>> = {}
  for (const key of ['from', 'to', 'date', 'passengers'] as const) {
    const value = params.get(key)
    if (value) defaults[key] = value
  }
  return defaults
}
