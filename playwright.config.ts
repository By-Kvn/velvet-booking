import { defineConfig, devices } from '@playwright/test'

// En local, le Chrome installé suffit (pas de téléchargement de navigateur) ; la CI installe Chromium.
const browserChannel = process.env.CI ? undefined : 'chrome'

/**
 * Tests end-to-end sur le build de production (vite preview) : même bundle, même service worker
 * et même API simulée que la démo en ligne.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'], channel: browserChannel } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], channel: browserChannel } },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
