import { describe, expect, it } from 'vitest'
import { formatDate, formatDuration, formatPassengers, formatPrice, formatTime, todayInParis } from './format'

// Intl insère des espaces insécables : on les normalise pour des assertions lisibles.
const plain = (text: string) => text.replace(/ | /g, ' ')

describe('formats', () => {
  it('affiche un prix en euros à la française', () => {
    expect(plain(formatPrice(5990))).toBe('59,90 €')
  })

  it("affiche l'heure de Paris, pas celle du navigateur", () => {
    expect(formatTime('2030-06-12T06:15:00Z')).toBe('08:15')
  })

  it.each([
    [130, '2 h 10'],
    [125, '2 h 05'],
    [120, '2 h'],
    [45, '45 min'],
  ])('formate %i minutes en « %s »', (minutes, expected) => {
    expect(formatDuration(minutes)).toBe(expected)
  })

  it('affiche une date longue sans décalage de jour', () => {
    expect(formatDate('2030-06-12')).toBe('mercredi 12 juin 2030')
  })

  it('calcule la date du jour à Paris, même tard le soir en UTC', () => {
    expect(todayInParis(new Date('2030-06-12T22:30:00Z'))).toBe('2030-06-13')
  })

  it('accorde le nombre de voyageurs', () => {
    expect(formatPassengers(1)).toBe('1 voyageur')
    expect(formatPassengers(3)).toBe('3 voyageurs')
  })
})
