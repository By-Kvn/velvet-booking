import { isScenario, SCENARIOS } from '../../mocks/scenario'
import { Select } from '../ui'
import { useDemoScenario } from './useDemoScenario'
import styles from './Layout.module.css'

/**
 * Sélecteur de démo : simule une panne ou un cas limite côté serveur, sans toucher au code.
 * Équivalent de ?scenario= dans l'URL, pour qu'un recruteur puisse tout tester en deux clics.
 */
export function DemoScenarioSelect() {
  const { scenario, changeScenario } = useDemoScenario()

  return (
    <Select
      className={styles.scenarioSelect}
      label="Scénario de démo"
      hint="Simule une panne ou un cas limite de l'API"
      options={Object.entries(SCENARIOS).map(([value, label]) => ({ value, label }))}
      value={scenario}
      onChange={(event) => {
        if (isScenario(event.target.value)) changeScenario(event.target.value)
      }}
    />
  )
}
