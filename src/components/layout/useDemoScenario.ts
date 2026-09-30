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
    // Les données en cache viennent de l'ancien scénario : on les recharge en arrière-plan.
    // invalidate plutôt que reset : l'écran garde ses données, un formulaire en cours n'est pas démonté.
    // Une requête bloquée par l'ancien scénario (timeout) est d'abord annulée, sinon elle ne serait pas relancée.
    void queryClient.cancelQueries().then(() => queryClient.invalidateQueries())
  }

  return { scenario, changeScenario }
}
