import { afterEach, describe, expect, it, vi } from 'vitest'
import { request } from '../api/client'
import { getStations } from '../api/trips'
import { z } from 'zod'
import { installInPageMocks } from './inPageMocks'
import { setScenario } from './scenario'

const originalFetch = window.fetch

afterEach(() => {
  window.fetch = originalFetch
  vi.restoreAllMocks()
})

describe('API simulée dans la page', () => {
  it('répond avec les mêmes handlers que les tests', async () => {
    installInPageMocks()
    expect(await getStations()).toContainEqual({ id: 'NTE', name: 'Nantes', city: 'Nantes' })
  })

  it('se comporte comme une API injoignable quand le navigateur est hors ligne', async () => {
    installInPageMocks()
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    await expect(getStations()).rejects.toMatchObject({ code: 'NETWORK' })
  })

  it('respecte le timeout du client face à une réponse simulée trop lente', async () => {
    installInPageMocks()
    setScenario('timeout')
    await expect(request('/stations', z.array(z.unknown()), { timeoutMs: 50 })).rejects.toMatchObject({
      code: 'TIMEOUT',
    })
  })

  it('reproduit une coupure réseau simulée', async () => {
    installInPageMocks()
    setScenario('network')
    await expect(getStations()).rejects.toMatchObject({ code: 'NETWORK' })
  })
})
