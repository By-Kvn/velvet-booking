import { expect, test } from '@playwright/test'
import { expectNoA11yViolations, TRAVEL_DATE } from './fixtures'

const pages = [
  { name: 'recherche', path: '/', ready: 'Départ' },
  { name: 'résultats', path: `/trajets?from=PMO&to=BSJ&date=${TRAVEL_DATE}&passengers=2`, ready: '7 trains directs' },
  { name: 'aucun résultat', path: `/trajets?from=NTE&to=RNS&date=${TRAVEL_DATE}&passengers=1`, ready: 'Aucun train direct' },
  { name: 'réservation', path: `/reservation/PMO_NTE_${TRAVEL_DATE}_1045?passengers=2`, ready: 'Voyageur 2' },
  { name: 'mes billets', path: '/billets', ready: 'Mes billets' },
  { name: 'page introuvable', path: '/nulle-part', ready: "Cette page n'existe pas" },
]

for (const { name, path, ready } of pages) {
  test(`aucune violation axe : ${name}`, async ({ page }) => {
    await page.goto(path)
    await expect(page.getByText(ready).first()).toBeVisible()
    await expectNoA11yViolations(page)
  })
}

test('aucune violation axe : erreurs de formulaire affichées', async ({ page }) => {
  await page.goto(`/reservation/PMO_NTE_${TRAVEL_DATE}_1045?passengers=1`)
  await page.getByRole('button', { name: 'Confirmer la réservation' }).click()
  await expect(page.getByText('Saisissez le prénom.')).toBeVisible()
  await expectNoA11yViolations(page)
})

test('aucune violation axe : bannière hors ligne', async ({ page, context }) => {
  await page.goto('/billets')
  await expect(page.getByRole('heading', { name: 'Mes billets' })).toBeVisible()
  await context.setOffline(true)
  await expect(page.getByText('Vous êtes hors ligne.')).toBeVisible()
  await expectNoA11yViolations(page)
})
