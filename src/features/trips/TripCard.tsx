import type { Fare, Trip } from '../../api/types'
import { ButtonLink } from '../../components/ui'
import { formatDuration, formatPrice, formatTime } from '../../lib/format'
import { FARE_CLASS_LABELS, getFareAvailability } from './fareAvailability'
import styles from './TripCard.module.css'

type TripCardProps = {
  trip: Trip
  passengers: number
}

export function TripCard({ trip, passengers }: TripCardProps) {
  const departure = formatTime(trip.departureAt)
  const arrival = formatTime(trip.arrivalAt)
  const titleId = `trip-${trip.id}`

  return (
    <article className={styles.card} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.times}>
        <time dateTime={trip.departureAt}>{departure}</time>
        <span className={styles.line} aria-hidden="true" />
        <span className="sr-only">, arrivée à </span>
        <time dateTime={trip.arrivalAt}>{arrival}</time>
      </h2>
      <p className={styles.meta}>
        Direct · {formatDuration(trip.durationMinutes)} · Train {trip.trainNumber}
      </p>
      <ul className={styles.fares}>
        {trip.fares.map((fare) => (
          <li key={fare.fareClass}>
            <FareOption trip={trip} fare={fare} passengers={passengers} departure={departure} />
          </li>
        ))}
      </ul>
    </article>
  )
}

type FareOptionProps = TripCardProps & { fare: Fare; departure: string }

function FareOption({ trip, fare, passengers, departure }: FareOptionProps) {
  const availability = getFareAvailability(fare, passengers)
  const label = FARE_CLASS_LABELS[fare.fareClass]
  const price = formatPrice(fare.priceCents)
  const bookable = availability.status === 'available' || availability.status === 'low'

  return (
    <div className={`${styles.fare} ${bookable ? '' : styles.unavailable}`}>
      <div>
        <p className={styles.fareClass}>{label}</p>
        <p className={styles.price}>
          {price}
          {passengers > 1 && <span className={styles.perPerson}> par voyageur</span>}
        </p>
        {availability.status === 'low' && (
          <p className={styles.warning}>Plus que {availability.seatsLeft} places</p>
        )}
        {availability.status === 'not-enough' && (
          <p className={styles.warning}>
            Seulement {availability.seatsLeft} place{availability.seatsLeft > 1 ? 's' : ''} pour {passengers} voyageurs
          </p>
        )}
      </div>
      {bookable ? (
        <ButtonLink
          to={`/reservation/${encodeURIComponent(trip.id)}?class=${fare.fareClass}&passengers=${passengers}`}
          variant={fare.fareClass === 'standard' ? 'primary' : 'secondary'}
        >
          Choisir<span className="sr-only"> {label} à {price}, départ {departure}</span>
        </ButtonLink>
      ) : (
        // Pas de bouton désactivé : un texte explicite, lisible et annoncé, dit pourquoi.
        <p className={styles.soldOut}>{availability.status === 'sold-out' ? 'Complet' : 'Indisponible'}</p>
      )}
    </div>
  )
}
