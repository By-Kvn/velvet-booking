import { ButtonLink, PageTitle } from '../components/ui'
import { TicketCard } from '../features/tickets/TicketCard'
import { useTickets } from '../features/tickets/useTickets'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import styles from './Page.module.css'

export function TicketsPage() {
  useDocumentTitle('Mes billets')
  const tickets = useTickets()
  const now = new Date().toISOString()
  const byDeparture = [...tickets].sort((a, b) => a.trip.departureAt.localeCompare(b.trip.departureAt))
  const upcoming = byDeparture.filter((ticket) => ticket.trip.arrivalAt >= now)
  const past = byDeparture.filter((ticket) => ticket.trip.arrivalAt < now).reverse()

  return (
    <div className={styles.stack}>
      <PageTitle>Mes billets</PageTitle>
      <p className={styles.lead}>Vos billets sont enregistrés sur cet appareil et restent consultables sans réseau.</p>

      {tickets.length === 0 && (
        <div className={styles.card}>
          <p>Vous n'avez pas encore de billet sur cet appareil.</p>
          <div>
            <ButtonLink to="/">Rechercher un trajet</ButtonLink>
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <section className={styles.stack} aria-labelledby="upcoming-title">
          <h2 id="upcoming-title">À venir</h2>
          <ul className={styles.list}>
            {upcoming.map((ticket) => (
              <li key={ticket.id}>
                <TicketCard booking={ticket} headingLevel="h3" />
              </li>
            ))}
          </ul>
        </section>
      )}

      {past.length > 0 && (
        <section className={styles.stack} aria-labelledby="past-title">
          <h2 id="past-title">Voyages passés</h2>
          <ul className={styles.list}>
            {past.map((ticket) => (
              <li key={ticket.id}>
                <TicketCard booking={ticket} headingLevel="h3" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
