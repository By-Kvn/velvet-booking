import { describe, expect, it } from 'vitest'
import { parseSearchCriteria, toSearchParams } from './searchCriteria'

const TODAY = '2030-06-10'
const parse = (query: string) => parseSearchCriteria(new URLSearchParams(query), TODAY)

describe("critères de recherche dans l'URL", () => {
  it('lit une recherche valide', () => {
    expect(parse('from=PMO&to=NTE&date=2030-06-12&passengers=2')).toEqual({
      status: 'valid',
      criteria: { from: 'PMO', to: 'NTE', date: '2030-06-12', passengers: 2 },
    })
  })

  it.each([
    ['paramètre manquant', 'from=PMO&date=2030-06-12&passengers=1'],
    ['départ égal à l’arrivée', 'from=PMO&to=PMO&date=2030-06-12&passengers=1'],
    ['date mal formée', 'from=PMO&to=NTE&date=12/06/2030&passengers=1'],
    ['trop de voyageurs', 'from=PMO&to=NTE&date=2030-06-12&passengers=12'],
    ['voyageurs non numérique', 'from=PMO&to=NTE&date=2030-06-12&passengers=deux'],
  ])('rejette un lien invalide (%s)', (_, query) => {
    expect(parse(query)).toEqual({ status: 'invalid' })
  })

  it('signale une date passée (lien partagé trop ancien)', () => {
    expect(parse('from=PMO&to=NTE&date=2030-06-01&passengers=1').status).toBe('past')
  })

  it('fait un aller-retour sans perte entre critères et URL', () => {
    const criteria = { from: 'NTE', to: 'PMO', date: '2030-06-12', passengers: 3 }
    expect(parse(toSearchParams(criteria).toString())).toEqual({ status: 'valid', criteria })
  })
})
