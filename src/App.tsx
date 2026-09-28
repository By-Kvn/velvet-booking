import { useQuery } from '@tanstack/react-query'
import { getErrorMessage } from './api/client'
import { getStations } from './api/trips'
import { Alert, Button, Select, Spinner, TextField } from './components/ui'
import { getScenario, SCENARIOS, setScenario, type Scenario } from './mocks/scenario'
import styles from './App.module.css'

/**
 * Jour 1 : page bac à sable pour vérifier le design system et l'API simulée.
 * Elle sera remplacée par le routing et le vrai parcours au jour 2.
 */
export function App() {
  const stations = useQuery({
    queryKey: ['stations'],
    queryFn: ({ signal }) => getStations(signal),
  })

  function changeScenario(value: string) {
    setScenario(value as Scenario)
    const url = new URL(window.location.href)
    url.searchParams.set('scenario', value)
    window.history.replaceState(null, '', url)
    stations.refetch()
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Velvet · Bac à sable</h1>

      <section className={styles.section} aria-labelledby="api-title">
        <h2 id="api-title">API simulée</h2>
        <Select
          label="Scénario"
          hint="Simule une panne ou un cas limite côté serveur"
          options={Object.entries(SCENARIOS).map(([value, label]) => ({ value, label }))}
          defaultValue={getScenario()}
          onChange={(event) => changeScenario(event.target.value)}
        />

        {stations.isPending && <Spinner label="Chargement des gares" />}
        {stations.isError && (
          <Alert
            tone="error"
            title="Gares indisponibles"
            action={
              <Button variant="secondary" onClick={() => stations.refetch()}>
                Réessayer
              </Button>
            }
          >
            {getErrorMessage(stations.error)}
          </Alert>
        )}
        {stations.isSuccess && (
          <ul className={styles.list}>
            {stations.data.map((station) => (
              <li key={station.id}>{station.name}</li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.section} aria-labelledby="ds-title">
        <h2 id="ds-title">Design system</h2>
        <div className={styles.row}>
          <Button>Rechercher</Button>
          <Button variant="secondary">Modifier</Button>
          <Button variant="ghost">Annuler</Button>
          <Button loading>Payer</Button>
        </div>
        <TextField label="Prénom" autoComplete="given-name" />
        <TextField label="E-mail" type="email" hint="Vos billets y seront envoyés" error="Saisissez une adresse e-mail valide, par exemple nom@exemple.fr" />
        <Alert tone="success" title="Réservation confirmée" />
        <Alert tone="warning" title="Plus que 3 places en Standard" />
        <Alert tone="info" title="Vous êtes hors ligne">Vos billets restent consultables.</Alert>
      </section>
    </main>
  )
}
