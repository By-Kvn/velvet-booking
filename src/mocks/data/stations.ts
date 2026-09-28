import type { Station } from '../../api/types'

export const stations: Station[] = [
  { id: 'PMO', name: 'Paris Montparnasse', city: 'Paris' },
  { id: 'BSJ', name: 'Bordeaux Saint-Jean', city: 'Bordeaux' },
  { id: 'NTE', name: 'Nantes', city: 'Nantes' },
  { id: 'ASL', name: 'Angers Saint-Laud', city: 'Angers' },
  { id: 'RNS', name: 'Rennes', city: 'Rennes' },
]

/** Lignes desservies depuis Paris, avec la durée du trajet en minutes. */
export const routes: Record<string, number> = {
  BSJ: 125,
  NTE: 130,
  ASL: 95,
  RNS: 90,
}
