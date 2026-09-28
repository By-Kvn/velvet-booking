import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../../api/client'
import { Alert, Button, LoadingState, Select, TextField } from '../../components/ui'
import { formatPassengers, todayInParis } from '../../lib/format'
import { useStations } from '../stations/useStations'
import { MAX_PASSENGERS, toSearchParams } from './searchCriteria'
import { createSearchFormSchema, type SearchFormValues } from './searchFormSchema'
import styles from './SearchForm.module.css'

type SearchFormProps = {
  defaultValues?: Partial<SearchFormValues>
}

const PASSENGER_OPTIONS = Array.from({ length: MAX_PASSENGERS }, (_, index) => ({
  value: String(index + 1),
  label: formatPassengers(index + 1),
}))

export function SearchForm({ defaultValues }: SearchFormProps) {
  const navigate = useNavigate()
  const stations = useStations()
  const today = todayInParis()
  const schema = useMemo(() => createSearchFormSchema(today), [today])
  const [announcement, setAnnouncement] = useState('')

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<SearchFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { from: '', to: '', date: today, passengers: '1', ...defaultValues },
  })

  function swapStations() {
    const { from, to } = getValues()
    setValue('from', to)
    setValue('to', from)
    // Le changement est visuel : on l'annonce aussi au lecteur d'écran.
    setAnnouncement(from || to ? 'Gares de départ et d’arrivée inversées.' : '')
  }

  function onSubmit(values: SearchFormValues) {
    const params = toSearchParams({ ...values, passengers: Number(values.passengers) })
    navigate(`/trajets?${params}`)
  }

  if (stations.isPending) return <LoadingState label="Chargement des gares" retrying={stations.failureCount > 0} />

  if (stations.isError) {
    return (
      <Alert
        tone="error"
        title="Impossible de charger les gares"
        action={
          <Button variant="secondary" onClick={() => stations.refetch()}>
            Réessayer
          </Button>
        }
      >
        {getErrorMessage(stations.error)}
      </Alert>
    )
  }

  const stationOptions = stations.data.map((station) => ({ value: station.id, label: station.name }))

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Rechercher un trajet">
      <div className={styles.stations}>
        <Select
          label="Départ"
          placeholder="Choisir une gare"
          options={stationOptions}
          error={errors.from?.message}
          {...register('from')}
        />
        <button type="button" className={styles.swap} onClick={swapStations}>
          <span aria-hidden="true">⇅</span>
          <span className="sr-only">Inverser le départ et l'arrivée</span>
        </button>
        <Select
          label="Arrivée"
          placeholder="Choisir une gare"
          options={stationOptions}
          error={errors.to?.message}
          {...register('to')}
        />
      </div>

      <div className={styles.row}>
        <TextField label="Date de départ" type="date" min={today} error={errors.date?.message} {...register('date')} />
        <Select label="Voyageurs" options={PASSENGER_OPTIONS} error={errors.passengers?.message} {...register('passengers')} />
      </div>

      <Button type="submit" fullWidth>
        Rechercher les trains
      </Button>

      <p role="status" className="sr-only">
        {announcement}
      </p>
    </form>
  )
}
