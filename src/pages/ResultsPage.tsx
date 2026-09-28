import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { getErrorMessage } from '../api/client'
import { searchTrips } from '../api/trips'
import { OfflineNotice } from '../components/OfflineNotice'
import { Alert, Button, ButtonLink, PageTitle } from '../components/ui'
import { parseSearchCriteria, toSearchParams, type SearchCriteria } from '../features/search/searchCriteria'
import { stationName, useStations } from '../features/stations/useStations'
import { TripCard } from '../features/trips/TripCard'
import { TripListSkeleton } from '../features/trips/TripListSkeleton'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { formatDate, formatPassengers, todayInParis } from '../lib/format'
import pageStyles from './Page.module.css'
import styles from './ResultsPage.module.css'

export function ResultsPage() {
  const [params] = useSearchParams()
  const parsed = parseSearchCriteria(params, todayInParis())

  if (parsed.status === 'valid') return <Results criteria={parsed.criteria} />
  return <InvalidSearch expired={parsed.status === 'past'} />
}

function InvalidSearch({ expired }: { expired: boolean }) {
  useDocumentTitle('Recherche à compléter')
  return (
    <div className={pageStyles.stack}>
      <PageTitle>{expired ? 'Cette date est passée' : 'Recherche incomplète'}</PageTitle>
      <Alert tone="warning" title={expired ? 'Ce lien concerne un voyage passé.' : 'Ce lien de recherche est incomplet.'}>
        Choisissez vos gares et votre date pour voir les trains disponibles.
      </Alert>
      <div>
        <ButtonLink to="/">Nouvelle recherche</ButtonLink>
      </div>
    </div>
  )
}

function Results({ criteria }: { criteria: SearchCriteria }) {
  const stations = useStations()
  const from = stationName(stations.data, criteria.from)
  const to = stationName(stations.data, criteria.to)
  useDocumentTitle(`Trains ${from} → ${to}`)

  const trips = useQuery({
    queryKey: ['trips', criteria],
    queryFn: ({ signal }) => searchTrips(criteria, signal),
  })

  const editLink = `/?${toSearchParams(criteria)}`

  return (
    <div className={pageStyles.stack}>
      <header className={styles.summary}>
        <PageTitle>
          {from} <span aria-hidden="true">→</span>
          <span className="sr-only"> vers </span> {to}
        </PageTitle>
        <p className={pageStyles.lead}>
          {formatDate(criteria.date)} · {formatPassengers(criteria.passengers)}
        </p>
        <div>
          <ButtonLink to={editLink} variant="ghost">
            Modifier la recherche
          </ButtonLink>
        </div>
      </header>

      {trips.isPending && trips.fetchStatus === 'paused' && <OfflineNotice title="Les trains ne peuvent pas être chargés hors ligne" />}
      {trips.isPending && trips.fetchStatus !== 'paused' && <TripListSkeleton retrying={trips.failureCount > 0} />}

      {trips.isError && (
        <Alert
          tone="error"
          title="Les trains n'ont pas pu être chargés"
          action={
            <Button variant="secondary" onClick={() => trips.refetch()}>
              Réessayer
            </Button>
          }
        >
          {getErrorMessage(trips.error)}
        </Alert>
      )}

      {trips.isSuccess && trips.data.length === 0 && (
        <Alert
          tone="info"
          title={`Aucun train direct entre ${from} et ${to}`}
          action={
            <ButtonLink to={editLink} variant="secondary">
              Modifier la recherche
            </ButtonLink>
          }
        >
          Velvet relie Paris à Bordeaux, Nantes, Angers et Rennes. Essayez un trajet au départ ou à destination de
          Paris.
        </Alert>
      )}

      {trips.isSuccess && trips.data.length > 0 && (
        <section aria-labelledby="results-count">
          <p id="results-count" role="status" className={styles.count}>
            {trips.data.length} train{trips.data.length > 1 ? 's' : ''} direct{trips.data.length > 1 ? 's' : ''}
          </p>
          <ul className={styles.list}>
            {trips.data.map((trip) => (
              <li key={trip.id}>
                <TripCard trip={trip} passengers={criteria.passengers} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
