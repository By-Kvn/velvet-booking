import { useQuery } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'react-router-dom'
import { ApiError, getErrorMessage } from '../api/client'
import { getTrip } from '../api/trips'
import { OfflineNotice } from '../components/OfflineNotice'
import { Alert, Button, ButtonLink, LoadingState, PageTitle } from '../components/ui'
import { BookingForm } from '../features/booking/BookingForm'
import { parseBookingParams } from '../features/booking/bookingParams'
import { TripSummary } from '../features/trips/TripSummary'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { formatPassengers } from '../lib/format'
import styles from './Page.module.css'

export function BookingPage() {
  useDocumentTitle('Réserver un trajet')
  const { tripId = '' } = useParams()
  const [params] = useSearchParams()
  const { fareClass, passengers } = parseBookingParams(params)

  const trip = useQuery({
    queryKey: ['trip', tripId],
    queryFn: ({ signal }) => getTrip(tripId, signal),
  })

  return (
    <div className={styles.stack}>
      <PageTitle>Réserver ce trajet</PageTitle>

      {trip.isPending && trip.fetchStatus === 'paused' && <OfflineNotice title="Ce trajet ne peut pas être chargé hors ligne" />}
      {trip.isPending && trip.fetchStatus !== 'paused' && (
        <LoadingState label="Chargement du trajet" retrying={trip.failureCount > 0} />
      )}

      {trip.isError && (
        <Alert
          tone="error"
          title="Ce trajet ne peut pas être affiché"
          action={
            trip.error instanceof ApiError && trip.error.isRetryable ? (
              <Button variant="secondary" onClick={() => trip.refetch()}>
                Réessayer
              </Button>
            ) : (
              <ButtonLink to="/" variant="secondary">
                Nouvelle recherche
              </ButtonLink>
            )
          }
        >
          {getErrorMessage(trip.error, { notFound: "Ce trajet n'existe plus. Relancez votre recherche." })}
        </Alert>
      )}

      {trip.isSuccess && (
        <>
          <section className={styles.card} aria-labelledby="recap-title">
            <h2 id="recap-title">Votre trajet · {formatPassengers(passengers)}</h2>
            <TripSummary trip={trip.data} />
          </section>
          <section className={styles.card} aria-labelledby="details-title">
            <h2 id="details-title">Vos informations</h2>
            <BookingForm trip={trip.data} passengers={passengers} preferredClass={fareClass} />
          </section>
        </>
      )}
    </div>
  )
}
