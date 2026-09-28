import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TICKETS_STORAGE_KEY } from '../features/tickets/ticketStorage'
import { findTripById } from '../mocks/data/trips'
import { renderRoute } from '../test/renderRoute'

function storedBooking(id: string, tripId: string, reference: string) {
  return {
    id,
    reference,
    trip: findTripById(tripId),
    fareClass: 'standard',
    passengers: [{ firstName: 'Ada', lastName: 'Lovelace' }],
    email: 'ada@exemple.fr',
    totalCents: 4900,
    createdAt: '2020-01-01T10:00:00.000Z',
  }
}

describe('mes billets', () => {
  it('invite à réserver quand aucun billet n’est enregistré', async () => {
    renderRoute('/billets')
    expect(await screen.findByText("Vous n'avez pas encore de billet sur cet appareil.")).toBeInTheDocument()
  })

  it('sépare les voyages à venir des voyages passés', async () => {
    localStorage.setItem(
      TICKETS_STORAGE_KEY,
      JSON.stringify([
        storedBooking('passe', 'PMO_NTE_2020-06-12_1045', 'PAS234'),
        storedBooking('futur', 'PMO_NTE_2030-06-12_1045', 'FUT234'),
      ]),
    )
    renderRoute('/billets')
    const upcoming = await screen.findByRole('region', { name: 'À venir' })
    expect(upcoming).toHaveTextContent('FUT234')
    expect(screen.getByRole('region', { name: 'Voyages passés' })).toHaveTextContent('PAS234')
  })

  it('ignore un billet corrompu dans le stockage local', async () => {
    localStorage.setItem(
      TICKETS_STORAGE_KEY,
      JSON.stringify([storedBooking('ok', 'PMO_NTE_2030-06-12_1045', 'VAL234'), { id: 'ko', reference: 42 }]),
    )
    renderRoute('/billets')
    expect(await screen.findAllByRole('article')).toHaveLength(1)
    expect(screen.getByText('VAL234')).toBeInTheDocument()
  })

  it('explique une confirmation absente de l’appareil', async () => {
    renderRoute('/confirmation/inconnue')
    expect(await screen.findByRole('heading', { name: 'Réservation introuvable' })).toBeInTheDocument()
  })
})
