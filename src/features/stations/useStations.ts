import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { stationSchema } from '../../api/schemas'
import { getStations } from '../../api/trips'
import type { Station } from '../../api/types'

const STORAGE_KEY = 'velvet:stations:v1'

/**
 * Dernière liste de gares connue, gardée sur l'appareil : un billet consulté hors ligne
 * affiche « Paris Montparnasse », pas « PMO ». Revalidée par Zod comme toute donnée locale.
 */
export function readCachedStations(): Station[] | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return undefined
    const parsed = z.array(stationSchema).safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : undefined
  } catch {
    return undefined
  }
}

function cacheStations(stations: Station[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stations))
  } catch {
    // Stockage indisponible : on fera sans, les codes de gare restent affichés hors ligne.
  }
}

export function useStations() {
  return useQuery({
    queryKey: ['stations'],
    // Volontairement sans signal d'annulation : sinon React Query annule la requête quand on quitte la page,
    // et la liste n'est jamais mémorisée si le réseau tombe juste après (billet affiché « PMO → BSJ »).
    queryFn: async () => {
      const stations = await getStations()
      cacheStations(stations)
      return stations
    },
    // La liste des gares ne change pas pendant une session.
    staleTime: Infinity,
    // Affichage immédiat depuis l'appareil, puis rafraîchissement depuis l'API (date 0 = périmée).
    initialData: readCachedStations,
    initialDataUpdatedAt: 0,
  })
}

/** Nom lisible d'une gare, avec repli sur son code si la liste n'est pas encore chargée. */
export function stationName(stations: Station[] | undefined, id: string): string {
  return stations?.find((station) => station.id === id)?.name ?? id
}
