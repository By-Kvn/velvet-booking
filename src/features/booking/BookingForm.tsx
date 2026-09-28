import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { createBooking } from '../../api/bookings'
import { ApiError, getErrorMessage } from '../../api/client'
import type { FareClass, Trip } from '../../api/types'
import { Alert, Button, ButtonLink, TextField } from '../../components/ui'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { formatPrice, parisDateOf } from '../../lib/format'
import { toSearchParams } from '../search/searchCriteria'
import { saveTicket } from '../tickets/ticketStorage'
import { getFareAvailability } from '../trips/fareAvailability'
import { bookingFormSchema, type BookingFormValues } from './bookingFormSchema'
import { FareClassField } from './FareClassField'
import styles from './BookingForm.module.css'

type BookingFormProps = {
  trip: Trip
  passengers: number
  preferredClass: FareClass
}

export function BookingForm({ trip, passengers, preferredClass }: BookingFormProps) {
  const navigate = useNavigate()
  const online = useOnlineStatus()
  const bookableClasses = trip.fares.filter((fare) => {
    const { status } = getFareAvailability(fare, passengers)
    return status === 'available' || status === 'low'
  })
  const defaultClass = bookableClasses.some((fare) => fare.fareClass === preferredClass)
    ? preferredClass
    : (bookableClasses[0]?.fareClass ?? preferredClass)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      fareClass: defaultClass,
      passengers: Array.from({ length: passengers }, () => ({ firstName: '', lastName: '' })),
      email: '',
    },
  })
  const { fields } = useFieldArray({ control, name: 'passengers' })

  const booking = useMutation({
    mutationFn: createBooking,
    onSuccess: (created) => {
      saveTicket(created)
      // replace : le retour arrière ne ramène pas sur un formulaire déjà soumis.
      navigate(`/confirmation/${encodeURIComponent(created.id)}`, { replace: true })
    },
  })

  const selectedClass = useWatch({ control, name: 'fareClass' })
  const selectedFare = trip.fares.find((fare) => fare.fareClass === selectedClass)
  const total = selectedFare ? formatPrice(selectedFare.priceCents * passengers) : undefined
  const resultsLink = `/trajets?${toSearchParams({
    from: trip.originId,
    to: trip.destinationId,
    date: parisDateOf(trip.departureAt),
    passengers,
  })}`

  function onSubmit(values: BookingFormValues) {
    // Double protection contre la double réservation : bouton en chargement + garde ici.
    // Hors ligne, React Query mettrait l'achat en pause puis l'enverrait au retour du réseau, à l'insu du voyageur.
    if (booking.isPending || !online) return
    booking.mutate({ tripId: trip.id, ...values })
  }

  if (bookableClasses.length === 0) {
    return (
      <Alert tone="warning" title="Ce train est complet" action={<ButtonLink to={resultsLink} variant="secondary">Voir les autres trains</ButtonLink>}>
        Il ne reste pas assez de places pour {passengers > 1 ? `${passengers} voyageurs` : 'ce trajet'}.
      </Alert>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Informations de réservation">
      <FareClassField fares={trip.fares} passengers={passengers} registration={register('fareClass')} />

      {fields.map((field, index) => (
        <fieldset key={field.id} className={styles.fieldset}>
          <legend className={styles.legend}>Voyageur {index + 1}</legend>
          <div className={styles.names}>
            <TextField
              label="Prénom"
              autoComplete={index === 0 ? 'given-name' : 'off'}
              error={errors.passengers?.[index]?.firstName?.message}
              {...register(`passengers.${index}.firstName`)}
            />
            <TextField
              label="Nom"
              autoComplete={index === 0 ? 'family-name' : 'off'}
              error={errors.passengers?.[index]?.lastName?.message}
              {...register(`passengers.${index}.lastName`)}
            />
          </div>
        </fieldset>
      ))}

      <TextField
        label="E-mail"
        type="email"
        autoComplete="email"
        hint="Pour recevoir la confirmation de réservation"
        error={errors.email?.message}
        {...register('email')}
      />

      {booking.isError && <BookingError error={booking.error} resultsLink={resultsLink} />}

      <div className={styles.total}>
        <span>Total</span>
        <strong>{total}</strong>
      </div>
      <Button
        type="submit"
        loading={booking.isPending}
        fullWidth
        aria-disabled={!online || undefined}
        aria-describedby={online ? undefined : 'booking-offline'}
      >
        Confirmer la réservation
      </Button>
      {!online && (
        <p id="booking-offline" className={styles.offlineHint}>
          Connexion requise pour réserver. Vos informations restent saisies.
        </p>
      )}
    </form>
  )
}

function BookingError({ error, resultsLink }: { error: Error; resultsLink: string }) {
  if (error instanceof ApiError && error.code === 'SOLD_OUT') {
    return (
      <Alert
        tone="error"
        title="Ce train vient d'être complet"
        action={
          <ButtonLink to={resultsLink} variant="secondary">
            Voir les autres trains
          </ButtonLink>
        }
      >
        {getErrorMessage(error)} Votre recherche est conservée.
      </Alert>
    )
  }
  if (error instanceof ApiError && error.code === 'TIMEOUT') {
    // L'achat a pu aboutir côté serveur : on n'invite pas à recliquer sans prévenir.
    return (
      <Alert tone="error" title="La confirmation n'est pas arrivée à temps">
        Votre réservation a peut-être été enregistrée. Vérifiez vos e-mails avant de réessayer, pour éviter une double
        réservation.
      </Alert>
    )
  }
  return (
    <Alert tone="error" title="La réservation n'a pas abouti">
      {getErrorMessage(error, { notFound: "Ce trajet n'existe plus. Relancez votre recherche." })}
    </Alert>
  )
}
