import type { Booking } from '../../api/types'
import { formatPrice } from '../../lib/format'
import { TripSummary } from '../trips/TripSummary'
import { FARE_CLASS_LABELS } from '../trips/fareAvailability'
import styles from './TicketCard.module.css'

type TicketCardProps = {
  booking: Booking
  headingLevel?: 'h2' | 'h3'
}

export function TicketCard({ booking, headingLevel: Heading = 'h2' }: TicketCardProps) {
  const titleId = `ticket-${booking.id}`
  return (
    <article className={styles.ticket} aria-labelledby={titleId}>
      <Heading id={titleId} className={styles.reference}>
        <span className={styles.referenceLabel}>Référence</span> {booking.reference}
      </Heading>
      <TripSummary trip={booking.trip} />
      <dl className={styles.details}>
        <div>
          <dt>Classe</dt>
          <dd>{FARE_CLASS_LABELS[booking.fareClass]}</dd>
        </div>
        <div>
          <dt>Voyageurs</dt>
          <dd>
            <ul className={styles.passengers}>
              {booking.passengers.map((passenger, index) => (
                <li key={index}>
                  {passenger.firstName} {passenger.lastName}
                </li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt>Total payé</dt>
          <dd>{formatPrice(booking.totalCents)}</dd>
        </div>
      </dl>
    </article>
  )
}
