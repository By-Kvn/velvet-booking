import { describe, expect, it } from 'vitest'
import type { Booking } from '../../api/types'
import { getTicket, getTickets, parseTickets, saveTicket, TICKETS_STORAGE_KEY } from './ticketStorage'

const booking: Booking = {
  id: 'b1',
  reference: 'ABC234',
  trip: {
    id: 'PMO_NTE_2030-06-12_1045',
    trainNumber: 'VV 8123',
    originId: 'PMO',
    destinationId: 'NTE',
    departureAt: '2030-06-12T08:45:00.000Z',
    arrivalAt: '2030-06-12T10:55:00.000Z',
    durationMinutes: 130,
    fares: [{ fareClass: 'standard', priceCents: 4900, seatsLeft: 20 }],
  },
  fareClass: 'standard',
  passengers: [{ firstName: 'Ada', lastName: 'Lovelace' }],
  email: 'ada@exemple.fr',
  totalCents: 4900,
  createdAt: '2030-06-01T10:00:00.000Z',
}

describe('billets enregistrés sur l’appareil', () => {
  it('enregistre puis relit un billet', () => {
    saveTicket(booking)
    expect(getTickets()).toEqual([booking])
    expect(getTicket('b1')).toEqual(booking)
  })

  it('ne duplique pas un billet enregistré deux fois', () => {
    saveTicket(booking)
    saveTicket(booking)
    expect(getTickets()).toHaveLength(1)
  })

  it('écarte un billet corrompu sans perdre les autres', () => {
    const corrupted = { ...booking, id: 'b2', reference: 'trop-longue' }
    expect(parseTickets(JSON.stringify([booking, corrupted, 'n’importe quoi']))).toEqual([booking])
  })

  it('ignore un stockage illisible', () => {
    localStorage.setItem(TICKETS_STORAGE_KEY, '{pas du json')
    expect(getTickets()).toEqual([])
    expect(parseTickets('{"pas":"un tableau"}')).toEqual([])
  })
})
