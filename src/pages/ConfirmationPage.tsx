import { useParams } from 'react-router-dom'
import { Alert, ButtonLink, PageTitle } from '../components/ui'
import { TicketCard } from '../features/tickets/TicketCard'
import { useTickets } from '../features/tickets/useTickets'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import styles from './Page.module.css'

export function ConfirmationPage() {
  const { bookingId = '' } = useParams()
  const booking = useTickets().find((ticket) => ticket.id === bookingId)
  useDocumentTitle(booking ? 'Réservation confirmée' : 'Réservation introuvable')

  if (!booking) {
    return (
      <div className={styles.stack}>
        <PageTitle>Réservation introuvable</PageTitle>
        <Alert tone="warning" title="Cette réservation n'est pas enregistrée sur cet appareil.">
          Retrouvez vos billets dans « Mes billets » ou dans l'e-mail de confirmation.
        </Alert>
        <div>
          <ButtonLink to="/billets">Voir mes billets</ButtonLink>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.stack}>
      <PageTitle>Réservation confirmée</PageTitle>
      <Alert tone="success" title={`Bon voyage ! Votre référence est ${booking.reference}.`}>
        Une confirmation a été envoyée à {booking.email}. Ce billet reste consultable sur cet appareil, même sans
        réseau.
      </Alert>
      <TicketCard booking={booking} />
      <div className={styles.actions}>
        <ButtonLink to="/billets">Voir mes billets</ButtonLink>
        <ButtonLink to="/" variant="ghost">
          Nouvelle recherche
        </ButtonLink>
      </div>
    </div>
  )
}
