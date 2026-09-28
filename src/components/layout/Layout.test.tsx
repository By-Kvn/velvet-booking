import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { setScenario } from '../../mocks/scenario'
import { renderRoute } from '../../test/renderRoute'

describe('layout', () => {
  it('propose un lien d’évitement vers le contenu principal', async () => {
    renderRoute('/')
    expect(screen.getByRole('link', { name: 'Aller au contenu' })).toHaveAttribute('href', '#contenu')
    expect(screen.getByRole('main')).toHaveAttribute('id', 'contenu')
  })

  it('affiche la mention de projet non officiel', () => {
    renderRoute('/')
    expect(screen.getByText(/Projet de démonstration non officiel/)).toBeInTheDocument()
  })

  it('déplace le focus sur le titre après une navigation', async () => {
    const { router } = renderRoute('/')
    await screen.findByRole('heading', { level: 1 })
    await router.navigate('/page-inconnue')
    expect(await screen.findByRole('heading', { name: "Cette page n'existe pas" })).toHaveFocus()
    expect(document.title).toBe('Page introuvable · Velvet')
  })

  it('signale un scénario de panne actif et permet d’en sortir', async () => {
    setScenario('timeout')
    const { user } = renderRoute('/')
    expect(screen.getByText('Mode démo : Le serveur ne répond pas à temps')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Revenir au fonctionnement normal' }))
    expect(screen.queryByText(/Mode démo/)).not.toBeInTheDocument()
    expect(await screen.findByLabelText('Départ')).toBeInTheDocument()
  })
})
