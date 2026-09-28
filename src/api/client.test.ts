import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { server } from '../mocks/node'
import { setScenario } from '../mocks/scenario'
import { ApiError, request } from './client'
import { getStations, getTrip, searchTrips } from './trips'

describe('client API', () => {
  it('renvoie des données validées par le contrat', async () => {
    const stations = await getStations()
    expect(stations).toContainEqual({ id: 'PMO', name: 'Paris Montparnasse', city: 'Paris' })
  })

  it('transforme une erreur 500 en erreur SERVER réessayable', async () => {
    setScenario('error')
    const error = await getStations().catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ code: 'SERVER', status: 500, isRetryable: true })
  })

  it('détecte une coupure réseau', async () => {
    setScenario('network')
    await expect(getStations()).rejects.toMatchObject({ code: 'NETWORK' })
  })

  it('rejette une réponse qui ne respecte pas le contrat', async () => {
    setScenario('invalid-contract')
    await expect(getStations()).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
  })

  it("déclenche un timeout si le serveur ne répond pas", async () => {
    server.use(
      http.get('/api/stations', async () => {
        await new Promise((resolve) => setTimeout(resolve, 200))
        return HttpResponse.json([])
      }),
    )
    await expect(request('/stations', z.array(z.unknown()), { timeoutMs: 50 })).rejects.toMatchObject({
      code: 'TIMEOUT',
    })
  })

  it('renvoie une 404 non réessayable pour un trajet inconnu', async () => {
    const error = await getTrip('inconnu').catch((e: unknown) => e)
    expect(error).toMatchObject({ code: 'NOT_FOUND', isRetryable: false })
  })
})

describe('recherche de trajets', () => {
  it('renvoie les trajets Paris → Nantes dans les deux sens', async () => {
    const aller = await searchTrips({ from: 'PMO', to: 'NTE', date: '2028-06-12', passengers: 1 })
    const retour = await searchTrips({ from: 'NTE', to: 'PMO', date: '2028-06-12', passengers: 1 })
    expect(aller.length).toBeGreaterThan(0)
    expect(retour.length).toBe(aller.length)
  })

  it("renvoie une liste vide pour une liaison non desservie", async () => {
    const trips = await searchTrips({ from: 'NTE', to: 'RNS', date: '2028-06-12', passengers: 1 })
    expect(trips).toEqual([])
  })

  it('inclut un train complet en Standard (cas limite)', async () => {
    const trips = await searchTrips({ from: 'PMO', to: 'BSJ', date: '2028-06-12', passengers: 1 })
    const soldOut = trips.find((trip) =>
      trip.fares.some((fare) => fare.fareClass === 'standard' && fare.seatsLeft === 0),
    )
    expect(soldOut).toBeDefined()
  })
})
