import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

/** Audit axe (WCAG 2.1 A et AA) : la page ne doit avoir aucune violation. */
export async function expectNoA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  expect(
    results.violations.map(({ id, help, nodes }) => ({ id, help, targets: nodes.map((node) => node.target) })),
  ).toEqual([])
}

/** Date future fixe : les tests ne dépendent pas du jour où ils tournent. */
export const TRAVEL_DATE = '2030-06-12'
