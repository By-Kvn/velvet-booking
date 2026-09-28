import { useQueryClient } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'
import { getScenario, setScenario, subscribeScenario, type Scenario } from '../../mocks/scenario'

/** Scénario de démo actif, partagé entre le sélecteur du footer et la bannière d'avertissement. */
export function useDemoScenario() {
  const queryClient = useQueryClient()
  const scenario = useSyncExternalStore(subscribeScenario, getScenario)

  function changeScenario(next: Scenario) {
    setScenario(next)
    const url = new URL(window.location.href)
    if (next === 'default') url.searchParams.delete('scenario')
    else url.searchParams.set('scenario', next)
    window.history.replaceState(window.history.state, '', url)
    // Les données en cache viennent de l'ancien scénario : on les recharge.
    void queryClient.resetQueries()
  }

  return { scenario, changeScenario }
}
