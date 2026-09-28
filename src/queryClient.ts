import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './api/client'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      // On ne réessaie que les erreurs passagères (réseau, timeout, 5xx),
      // jamais un 404 ou une réponse invalide : réessayer ne changerait rien.
      retry: (failureCount, error) =>
        error instanceof ApiError && error.isRetryable && failureCount < 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
    },
    mutations: {
      // Un achat n'est jamais rejoué automatiquement : risque de double réservation.
      retry: false,
    },
  },
})
