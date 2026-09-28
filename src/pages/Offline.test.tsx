import { onlineManager } from '@tanstack/react-query'
import { act, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { server } from '../mocks/node'
import { renderRoute } from '../test/renderRoute'

const goOffline = () => act(() => onlineManager.setOnline(false))
const goOnline = () => act(() => onlineManager.setOnline(true))

describe('hors ligne', () => {
  it('annonce la perte puis le retour du réseau', async () => {
    renderRoute('/')
    await screen.findByLabelText('Départ')
    goOffline()
    expect(screen.getByText('Vous êtes hors ligne.')).toBeInTheDocument()

    goOnline()
    expect(screen.queryByText('Vous êtes hors ligne.')).not.toBeInTheDocument()
    expect(screen.getByText('Connexion rétablie.')).toBeInTheDocument()
  })

  it('explique que la recherche attend le réseau au lieu d’un chargement sans fin', async () => {
    goOffline()
    renderRoute('/')
    expect(await screen.findByText('La recherche de trains nécessite une connexion')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /billets/i }).length).toBeGreaterThan(0)
  })

  it('reprend la recherche automatiquement au retour du réseau', async () => {
    goOffline()
    renderRoute('/trajets?from=PMO&to=NTE&date=2030-06-12&passengers=1')
    expect(await screen.findByText('Les trains ne peuvent pas être chargés hors ligne')).toBeInTheDocument()

    goOnline()
    expect(await screen.findByText('7 trains directs')).toBeInTheDocument()
  })

  it('bloque la réservation hors ligne, sans envoyer la requête et sans perdre la saisie', async () => {
    const posts: string[] = []
    server.events.on('request:start', ({ request }) => {
      if (request.method === 'POST') posts.push(request.url)
    })
    const { user } = renderRoute('/reservation/PMO_NTE_2030-06-12_1045?passengers=1')
    const group = await screen.findByRole('group', { name: 'Voyageur 1' })
    await user.type(within(group).getByLabelText('Prénom'), 'Ada')
    await user.type(within(group).getByLabelText('Nom'), 'Lovelace')
    await user.type(screen.getByLabelText('E-mail'), 'ada@exemple.fr')

    goOffline()
    const submit = screen.getByRole('button', { name: 'Confirmer la réservation' })
    expect(submit).toHaveAccessibleDescription('Connexion requise pour réserver. Vos informations restent saisies.')
    await user.click(submit)

    expect(posts).toEqual([])
    expect(within(group).getByLabelText('Prénom')).toHaveValue('Ada')
    server.events.removeAllListeners()
  })
})
