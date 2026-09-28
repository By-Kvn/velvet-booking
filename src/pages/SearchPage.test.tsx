import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderRoute } from '../test/renderRoute'

async function fillSearch(user: ReturnType<typeof renderRoute>['user'], from: string, to: string) {
  await user.selectOptions(await screen.findByLabelText('Départ'), from)
  await user.selectOptions(screen.getByLabelText('Arrivée'), to)
}

describe('recherche de trajet', () => {
  it("envoie vers les résultats avec les critères dans l'URL", async () => {
    const { router, user } = renderRoute('/')
    await fillSearch(user, 'PMO', 'NTE')
    const date = screen.getByLabelText('Date de départ')
    await user.clear(date)
    await user.type(date, '2030-06-12')
    await user.selectOptions(screen.getByLabelText('Voyageurs'), '2')
    await user.click(screen.getByRole('button', { name: 'Rechercher les trains' }))

    expect(router.state.location.pathname).toBe('/trajets')
    expect(router.state.location.search).toBe('?from=PMO&to=NTE&date=2030-06-12&passengers=2')
  })

  it('refuse un départ identique à l’arrivée, avec un message relié au champ', async () => {
    const { router, user } = renderRoute('/')
    await fillSearch(user, 'PMO', 'PMO')
    await user.click(screen.getByRole('button', { name: 'Rechercher les trains' }))

    const arrival = screen.getByLabelText('Arrivée')
    expect(arrival).toHaveAttribute('aria-invalid', 'true')
    expect(arrival).toHaveAccessibleDescription(/différente de la gare de départ/)
    expect(router.state.location.pathname).toBe('/')
  })

  it('demande les gares manquantes et place le focus sur le premier champ en erreur', async () => {
    const { user } = renderRoute('/')
    await screen.findByLabelText('Départ')
    await user.click(screen.getByRole('button', { name: 'Rechercher les trains' }))

    expect(screen.getByText('Choisissez une gare de départ.')).toBeInTheDocument()
    expect(screen.getByLabelText('Départ')).toHaveFocus()
  })

  it('inverse départ et arrivée et l’annonce', async () => {
    const { user } = renderRoute('/')
    await fillSearch(user, 'PMO', 'BSJ')
    await user.click(screen.getByRole('button', { name: "Inverser le départ et l'arrivée" }))

    expect(screen.getByLabelText('Départ')).toHaveValue('BSJ')
    expect(screen.getByLabelText('Arrivée')).toHaveValue('PMO')
    expect(screen.getByText('Gares de départ et d’arrivée inversées.')).toBeInTheDocument()
  })

  it('préremplit le formulaire depuis l’URL (« Modifier la recherche »)', async () => {
    renderRoute('/?from=NTE&to=PMO&date=2030-06-12&passengers=3')
    expect(await screen.findByLabelText('Départ')).toHaveValue('NTE')
    expect(screen.getByLabelText('Arrivée')).toHaveValue('PMO')
    expect(screen.getByLabelText('Voyageurs')).toHaveValue('3')
  })
})
