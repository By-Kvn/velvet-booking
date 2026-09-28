import { SCENARIOS } from '../../mocks/scenario'
import { Alert, Button } from '../ui'
import { useDemoScenario } from './useDemoScenario'

/** Un scénario de panne mémorisé dans la session ne doit jamais passer pour un vrai bug. */
export function DemoBanner() {
  const { scenario, changeScenario } = useDemoScenario()
  if (scenario === 'default') return null

  return (
    <Alert
      tone="warning"
      title={`Mode démo : ${SCENARIOS[scenario]}`}
      action={
        <Button variant="secondary" onClick={() => changeScenario('default')}>
          Revenir au fonctionnement normal
        </Button>
      }
    >
      L'API simulée reproduit volontairement ce cas limite.
    </Alert>
  )
}
