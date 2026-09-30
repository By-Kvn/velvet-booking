import { expect, test } from '@playwright/test'
import { TRAVEL_DATE } from './fixtures'

test('parcours complet : recherche, réservation, confirmation, billet', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Départ', { exact: true }).selectOption({ label: 'Paris Montparnasse' })
  await page.getByLabel('Arrivée', { exact: true }).selectOption({ label: 'Nantes' })
  await page.getByLabel('Date de départ').fill(TRAVEL_DATE)
  await page.getByLabel('Voyageurs').selectOption('2')
  await page.getByRole('button', { name: 'Rechercher les trains' }).click()

  await expect(page).toHaveURL(`/trajets?from=PMO&to=NTE&date=${TRAVEL_DATE}&passengers=2`)
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
  await page.getByRole('link', { name: /Choisir Standard.*départ 10:45/ }).click()

  await expect(page.getByRole('heading', { name: 'Réserver ce trajet' })).toBeVisible()
  const first = page.getByRole('group', { name: 'Voyageur 1' })
  await first.getByLabel('Prénom').fill('Ada')
  await first.getByLabel('Nom', { exact: true }).fill('Lovelace')
  const second = page.getByRole('group', { name: 'Voyageur 2' })
  await second.getByLabel('Prénom').fill('Alan')
  await second.getByLabel('Nom', { exact: true }).fill('Turing')
  await page.getByLabel('E-mail').fill('ada@exemple.fr')
  await page.getByRole('button', { name: 'Confirmer la réservation' }).click()

  await expect(page.getByRole('heading', { level: 1, name: 'Réservation confirmée' })).toBeVisible()
  const reference = await page.getByRole('article').getByRole('heading').innerText()

  await page.getByRole('link', { name: 'Voir mes billets' }).click()
  await expect(page.getByRole('region', { name: 'À venir' })).toContainText(reference.replace('Référence', '').trim())

  // Retour arrière : on ne revient pas sur le formulaire déjà soumis.
  await page.goBack()
  await page.goBack()
  await expect(page).toHaveURL(/\/trajets\?/)
})

test('train devenu complet au moment de payer : message clair et recherche conservée', async ({ page }) => {
  await page.goto(`/reservation/PMO_NTE_${TRAVEL_DATE}_1045?class=standard&passengers=1`)
  const passenger = page.getByRole('group', { name: 'Voyageur 1' })
  await passenger.getByLabel('Prénom').fill('Ada')
  await passenger.getByLabel('Nom', { exact: true }).fill('Lovelace')
  await page.getByLabel('E-mail').fill('ada@exemple.fr')
  await page.getByLabel('Scénario de démo').selectOption('sold-out')
  await page.getByRole('button', { name: 'Confirmer la réservation' }).click()

  const alert = page.getByRole('alert')
  await expect(alert).toContainText("Ce train vient d'être complet")
  await alert.getByRole('link', { name: 'Voir les autres trains' }).click()
  await expect(page).toHaveURL(`/trajets?from=PMO&to=NTE&date=${TRAVEL_DATE}&passengers=1`)
})

test('le lien d’évitement mène au contenu au clavier', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Navigation clavier testée sur desktop')
  await page.goto('/')
  const skipLink = page.getByRole('link', { name: 'Aller au contenu' })
  // L'app s'affiche après le démarrage de l'API simulée : on attend qu'elle soit prête.
  await expect(page.getByLabel('Départ', { exact: true })).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(skipLink).toBeFocused()
  await expect(skipLink).toBeInViewport()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#contenu$/)
})
