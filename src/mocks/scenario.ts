/**
 * Scénarios de démo, activables via l'URL : ?scenario=error
 * Ils permettent de tester chaque cas limite sans toucher au code.
 */
export const SCENARIOS = {
  default: 'Tout fonctionne normalement',
  slow: 'Réseau lent (3 s par requête)',
  timeout: 'Le serveur ne répond pas à temps',
  error: 'Erreur serveur (500)',
  network: 'Coupure réseau',
  'sold-out': 'Tous les trains sont complets',
  'invalid-contract': "Le backend renvoie des données qui ne respectent pas le contrat",
} as const

export type Scenario = keyof typeof SCENARIOS

const STORAGE_KEY = 'velvet:scenario'
let current: Scenario = 'default'
const listeners = new Set<() => void>()

export function isScenario(value: unknown): value is Scenario {
  return typeof value === 'string' && value in SCENARIOS
}

/** Abonnement pour l'interface (bannière de démo), compatible useSyncExternalStore. */
export function subscribeScenario(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getScenario(): Scenario {
  return current
}

export function setScenario(scenario: Scenario) {
  current = scenario
  listeners.forEach((listener) => listener())
  try {
    sessionStorage.setItem(STORAGE_KEY, scenario)
  } catch {
    // Stockage indisponible (navigation privée stricte) : le scénario reste en mémoire.
  }
}

/** Lit ?scenario= dans l'URL, sinon reprend celui de la session. */
export function initScenarioFromUrl() {
  const fromUrl = new URLSearchParams(window.location.search).get('scenario')
  let fromSession: string | null = null
  try {
    fromSession = sessionStorage.getItem(STORAGE_KEY)
  } catch {
    fromSession = null
  }
  const candidate = fromUrl ?? fromSession
  setScenario(isScenario(candidate) ? candidate : 'default')
}
