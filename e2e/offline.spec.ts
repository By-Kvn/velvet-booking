import { expect, test } from '@playwright/test'
import { TRAVEL_DATE } from './fixtures'

test('les billets restent consultables sans réseau, et l’achat attend le retour du réseau', async ({ page, context }) => {
  // Réservation en ligne
  await page.goto(`/reservation/PMO_BSJ_${TRAVEL_DATE}_1045?class=first&passengers=1`)
  const passenger = page.getByRole('group', { name: 'Voyageur 1' })
  await passenger.getByLabel('Prénom').fill('Ada')
  await passenger.getByLabel('Nom', { exact: true }).fill('Lovelace')
  await page.getByLabel('E-mail').fill('ada@exemple.fr')
  await page.getByRole('button', { name: 'Confirmer la réservation' }).click()
  await expect(page.getByRole('heading', { name: 'Réservation confirmée' })).toBeVisible()
  // Le service worker doit contrôler la page pour servir l'app hors ligne.
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null)

  await context.setOffline(true)
  await expect(page.getByText('Vous êtes hors ligne.')).toBeVisible()

  // Rechargement complet sans réseau : la coque vient du cache, le billet du stockage local.
  await page.goto('/billets')
  const ticket = page.getByRole('region', { name: 'À venir' }).getByRole('article')
  await expect(ticket).toHaveCount(1)
  // Noms de gares mémorisés sur l'appareil : pas de « PMO → BSJ » hors ligne.
  await expect(ticket).toContainText('Paris Montparnasse → Bordeaux Saint-Jean')

  // La recherche reste préparable (gares en cache), mais son envoi attend le réseau.
  await page.goto('/')
  const search = page.getByRole('button', { name: 'Rechercher les trains' })
  await expect(search).toHaveAccessibleDescription('Connexion requise pour rechercher des trains.')
  // force : Playwright refuse de cliquer un bouton aria-disabled ; on vérifie justement que le clic ne fait rien.
  await search.click({ force: true })
  await expect(page).toHaveURL('/')

  await context.setOffline(false)
  await expect(page.getByText('Connexion rétablie.')).toBeVisible()
  await expect(page.getByLabel('Départ', { exact: true })).toBeVisible()
})
