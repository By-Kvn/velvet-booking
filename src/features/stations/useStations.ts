import { useQuery } from '@tanstack/react-query'
import { getStations } from '../../api/trips'
import type { Station } from '../../api/types'

export function useStations() {
  return useQuery({
    queryKey: ['stations'],
    queryFn: ({ signal }) => getStations(signal),
    // La liste des gares ne change pas pendant une session.
    staleTime: Infinity,
  })
}

/** Nom lisible d'une gare, avec repli sur son code si la liste n'est pas encore chargée. */
export function stationName(stations: Station[] | undefined, id: string): string {
  return stations?.find((station) => station.id === id)?.name ?? id
}
