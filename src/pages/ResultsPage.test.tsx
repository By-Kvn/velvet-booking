import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { setScenario } from '../mocks/scenario'
import { renderRoute } from '../test/renderRoute'

const search = (from: string, to: string, passengers = 1) =>
  `/trajets?from=${from}&to=${to}&date=2030-06-12&passengers=${passengers}`

describe('résultats de recherche', () => {
  it('affiche un squelette puis les trains, avec le trajet en titre', async () => {
    renderRoute(search('PMO', 'NTE'))
    expect(screen.getByText('Recherche des trajets en cours')).toBeInTheDocument()

    expect(await screen.findByText('7 trains directs')).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(7)
    expect(screen.getByRole('heading', { level: 1, name: 'Paris Montparnasse vers Nantes' })).toBeInTheDocument()
    expect(document.title).toBe('Trains Paris Montparnasse → Nantes · Velvet')
  })

  it('indique une classe complète par un texte, sans lien de réservation', async () => {
    renderRoute(search('PMO', 'BSJ'))
    const trains = await screen.findAllByRole('article')
    // Le train de 08:15 est complet en Standard dans les données simulées.
    const soldOut = trains.find((train) => within(train).queryByText('Complet'))
    expect(soldOut).toBeDefined()
    expect(within(soldOut!).getAllByRole('link', { name: /choisir/i })).toHaveLength(1)
  })

  it('explique une liaison non desservie et propose de modifier la recherche', async () => {
    renderRoute(search('NTE', 'RNS'))
    expect(await screen.findByText('Aucun train direct entre Nantes et Rennes')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Modifier la recherche' })[0]).toHaveAttribute(
      'href',
      '/?from=NTE&to=RNS&date=2030-06-12&passengers=1',
    )
  })

  it('affiche une erreur récupérable et relance la recherche', async () => {
    setScenario('error')
    const { user } = renderRoute(search('PMO', 'NTE'))
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Le service est momentanément indisponible')

    setScenario('default')
    await user.click(within(alert).getByRole('button', { name: 'Réessayer' }))
    expect(await screen.findByText('7 trains directs')).toBeInTheDocument()
  })

  it('refuse un lien de recherche invalide', async () => {
    renderRoute('/trajets?from=PMO&to=PMO&date=2030-06-12&passengers=1')
    expect(await screen.findByRole('heading', { name: 'Recherche incomplète' })).toBeInTheDocument()
  })

  it('refuse un lien dont la date est passée', async () => {
    renderRoute('/trajets?from=PMO&to=NTE&date=2020-01-01&passengers=1')
    expect(await screen.findByRole('heading', { name: 'Cette date est passée' })).toBeInTheDocument()
  })
})
