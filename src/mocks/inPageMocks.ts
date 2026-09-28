import { getResponse } from 'msw'
import { handlers } from './handlers'

/**
 * API simulée dans la page (fetch intercepté) plutôt que par le service worker de MSW.
 * Un seul service worker peut contrôler « / » : c'est celui de la PWA, qui rend l'app disponible hors ligne.
 * Les handlers sont les mêmes que dans les tests (msw/node).
 */
export function installInPageMocks() {
  const networkFetch = window.fetch.bind(window)

  window.fetch = async (input, init) => {
    const request = new Request(input, init)
    if (!new URL(request.url).pathname.startsWith('/api/')) return networkFetch(input, init)

    // Mode avion ou « Offline » des DevTools : même comportement qu'une vraie API injoignable.
    if (!navigator.onLine) throw new TypeError('Failed to fetch')

    const response = await abortable(getResponse(handlers, request), request.signal)
    if (!response) return networkFetch(input, init)
    if (response.type === 'error') throw new TypeError('Failed to fetch')
    return response
  }
}

/** Le timeout et l'annulation du client doivent aussi interrompre une réponse simulée lente. */
function abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) return Promise.reject(signal.reason)
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(signal.reason)
    signal.addEventListener('abort', onAbort, { once: true })
    promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', onAbort))
  })
}
