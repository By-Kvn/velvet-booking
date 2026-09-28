import { describe, expect, it } from 'vitest'
import { getFareAvailability } from './fareAvailability'

const fare = (seatsLeft: number) => ({ fareClass: 'standard' as const, priceCents: 4900, seatsLeft })

describe('disponibilité d’un tarif', () => {
  it('est complet sans place restante', () => {
    expect(getFareAvailability(fare(0), 1)).toEqual({ status: 'sold-out' })
  })

  it('refuse un groupe plus grand que les places restantes', () => {
    expect(getFareAvailability(fare(2), 3)).toEqual({ status: 'not-enough', seatsLeft: 2 })
  })

  it('prévient quand il reste peu de places', () => {
    expect(getFareAvailability(fare(10), 2)).toEqual({ status: 'low', seatsLeft: 10 })
  })

  it('reste disponible au-delà du seuil', () => {
    expect(getFareAvailability(fare(11), 2)).toEqual({ status: 'available' })
  })

  it('accepte un groupe égal aux places restantes (cas limite)', () => {
    expect(getFareAvailability(fare(3), 3).status).toBe('low')
  })
})
