import type { Trip } from '../../api/types'
import { formatDate, formatDuration, formatTime, parisDateOf } from '../../lib/format'
import { stationName, useStations } from '../stations/useStations'
import styles from './TripSummary.module.css'

/** Récapitulatif compact d'un trajet : réservation, confirmation et billets. */
export function TripSummary({ trip }: { trip: Trip }) {
  const stations = useStations()
  return (
    <dl className={styles.summary}>
      <div>
        <dt>Trajet</dt>
        <dd>
          {stationName(stations.data, trip.originId)} → {stationName(stations.data, trip.destinationId)}
        </dd>
      </div>
      <div>
        <dt>Date</dt>
        <dd>{formatDate(parisDateOf(trip.departureAt))}</dd>
      </div>
      <div>
        <dt>Horaires</dt>
        <dd>
          <time dateTime={trip.departureAt}>{formatTime(trip.departureAt)}</time> –{' '}
          <time dateTime={trip.arrivalAt}>{formatTime(trip.arrivalAt)}</time> ({formatDuration(trip.durationMinutes)})
        </dd>
      </div>
      <div>
        <dt>Train</dt>
        <dd>{trip.trainNumber}, direct</dd>
      </div>
    </dl>
  )
}
