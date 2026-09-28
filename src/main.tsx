import { onlineManager, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { initScenarioFromUrl } from './mocks/scenario'
import { queryClient } from './queryClient'
import { routes } from './router'
import './styles/global.css'

/**
 * La démo tourne sur une API simulée (y compris en production sur Vercel).
 * Pour brancher un vrai backend : VITE_ENABLE_MOCKS=false
 */
async function enableMocking() {
  if (import.meta.env.VITE_ENABLE_MOCKS === 'false') return
  const { installInPageMocks } = await import('./mocks/inPageMocks')
  initScenarioFromUrl()
  installInPageMocks()
}

const root = document.getElementById('root')
if (!root) throw new Error('Élément #root introuvable')

// Une PWA peut démarrer sans réseau : React Query doit le savoir dès le lancement, pas au premier événement.
onlineManager.setOnline(navigator.onLine)

const router = createBrowserRouter(routes)

enableMocking().then(() => {
  createRoot(root).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  )
})
