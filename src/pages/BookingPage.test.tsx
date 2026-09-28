import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { getTickets } from '../features/tickets/ticketStorage'
import { server } from '../mocks/node'
import { setScenario } from '../mocks/scenario'
import { renderRoute } from '../test/renderRoute'

const TRIP = 'PMO_NTE_2030-06-12_1045'
// Dans les données simulées, le train de 08:15 est complet en Standard.
const SOLD_OUT_STANDARD_TRIP = 'PMO_BSJ_2030-06-12_0815'

type User = ReturnType<typeof renderRoute>['user']

async function fillPassenger(user: User, index: number, firstName: string, lastName: string) {
  const group = await screen.findByRole('group', { name: `Voyageur ${index}` })
  await user.type(within(group).getByLabelText('Prénom'), firstName)
  await user.type(within(group).getByLabelText('Nom'), lastName)
}

describe('réservation', () => {
  it('réserve pour deux voyageurs, confirme et enregistre le billet sur l’appareil', async () => {
    const { user, router } = renderRoute(`/reservation/${TRIP}?class=standard&passengers=2`)
    await fillPassenger(user, 1, 'Ada', 'Lovelace')
    await fillPassenger(user, 2, 'Alan', 'Turing')
    await user.type(screen.getByLabelText('E-mail'), 'ada@exemple.fr')
    await user.click(screen.getByRole('button', { name: 'Confirmer la réservation' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Réservation confirmée' })).toBeInTheDocument()
    expect(router.state.location.pathname).toMatch(/^\/confirmation\//)
    const [ticket] = getTickets()
    expect(ticket?.passengers).toEqual([
      { firstName: 'Ada', lastName: 'Lovelace' },
      { firstName: 'Alan', lastName: 'Turing' },
    ])
    expect(screen.getByText(`Bon voyage ! Votre référence est ${ticket?.reference}.`)).toBeInTheDocument()
  })

  it('bloque un formulaire incomplet sans appeler l’API', async () => {
    const requests: string[] = []
    server.events.on('request:start', ({ request }) => {
      if (request.method === 'POST') requests.push(request.url)
    })
    const { user } = renderRoute(`/reservation/${TRIP}?passengers=1`)
    await user.click(await screen.findByRole('button', { name: 'Confirmer la réservation' }))

    expect(screen.getByLabelText('Prénom')).toHaveFocus()
    expect(screen.getByLabelText('Prénom')).toHaveAccessibleDescription(/Saisissez le prénom/)
    expect(screen.getByLabelText('E-mail')).toHaveAccessibleDescription(/Saisissez votre adresse e-mail/)
    expect(requests).toEqual([])
    server.events.removeAllListeners()
  })

  it('n’envoie qu’une seule réservation malgré un double clic', async () => {
    const posts: string[] = []
    server.events.on('request:start', ({ request }) => {
      if (request.method === 'POST') posts.push(request.url)
    })
    const { user } = renderRoute(`/reservation/${TRIP}?passengers=1`)
    await fillPassenger(user, 1, 'Ada', 'Lovelace')
    await user.type(screen.getByLabelText('E-mail'), 'ada@exemple.fr')
    // Réponse lente : le second clic arrive pendant que la première réservation est en cours.
    setScenario('slow')
    const submit = screen.getByRole('button', { name: 'Confirmer la réservation' })
    await user.dblClick(submit)
    await user.keyboard('{Enter}')

    expect(submit).toHaveAttribute('aria-busy', 'true')
    expect(posts).toHaveLength(1)
    server.events.removeAllListeners()
  })

  it('explique un train devenu complet et ramène aux résultats sans perdre la recherche', async () => {
    const { user } = renderRoute(`/reservation/${TRIP}?passengers=1`)
    await fillPassenger(user, 1, 'Ada', 'Lovelace')
    await user.type(screen.getByLabelText('E-mail'), 'ada@exemple.fr')
    setScenario('sold-out')
    await user.click(screen.getByRole('button', { name: 'Confirmer la réservation' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent("Ce train vient d'être complet")
    expect(within(alert).getByRole('link', { name: 'Voir les autres trains' })).toHaveAttribute(
      'href',
      '/trajets?from=PMO&to=NTE&date=2030-06-12&passengers=1',
    )
    expect(getTickets()).toEqual([])
  })

  it('présélectionne une classe disponible quand celle demandée est complète', async () => {
    renderRoute(`/reservation/${SOLD_OUT_STANDARD_TRIP}?class=standard&passengers=1`)
    expect(await screen.findByRole('radio', { name: /Première/ })).toBeChecked()
    expect(screen.getByRole('radio', { name: /Standard/ })).toBeDisabled()
    expect(screen.getByText('Complet pour ce train')).toBeInTheDocument()
  })

  it('affiche un message adapté pour un trajet inconnu', async () => {
    renderRoute('/reservation/inconnu')
    expect(await screen.findByRole('alert')).toHaveTextContent("Ce trajet n'existe plus. Relancez votre recherche.")
    expect(screen.getByRole('link', { name: 'Nouvelle recherche' })).toBeInTheDocument()
  })
})
