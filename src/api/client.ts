import type { z } from 'zod'
import { apiErrorBodySchema } from './schemas'

export type ApiErrorCode =
  | 'NETWORK' // pas de réseau, serveur injoignable
  | 'TIMEOUT' // le serveur met trop de temps à répondre
  | 'NOT_FOUND'
  | 'SOLD_OUT'
  | 'VALIDATION'
  | 'SERVER'
  | 'INVALID_RESPONSE' // la réponse ne respecte pas le contrat

export class ApiError extends Error {
  readonly status: number
  readonly code: ApiErrorCode

  constructor(status: number, code: ApiErrorCode, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }

  /** Erreurs passagères : ça vaut le coup de réessayer. */
  get isRetryable(): boolean {
    return this.code === 'NETWORK' || this.code === 'TIMEOUT' || this.code === 'SERVER'
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
  timeoutMs?: number
}

const DEFAULT_TIMEOUT_MS = 8000

const KNOWN_CODES: ReadonlySet<string> = new Set<ApiErrorCode>([
  'NOT_FOUND',
  'SOLD_OUT',
  'VALIDATION',
  'SERVER',
])

function codeFromStatus(status: number): ApiErrorCode {
  if (status === 404) return 'NOT_FOUND'
  if (status === 409) return 'SOLD_OUT'
  if (status === 400 || status === 422) return 'VALIDATION'
  return 'SERVER'
}

function buildUrl(path: string): string {
  // URL absolue : fonctionne dans le navigateur comme dans les tests (jsdom).
  return new URL(`/api${path}`, window.location.origin).toString()
}

export async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  { method = 'GET', body, signal, timeoutMs = DEFAULT_TIMEOUT_MS }: RequestOptions = {},
): Promise<T> {
  // Un seul signal qui combine l'annulation externe (React Query) et le timeout.
  const timeoutSignal = AbortSignal.timeout(timeoutMs)
  const combined = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal

  let response: Response
  try {
    response = await fetch(buildUrl(path), {
      method,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: combined,
    })
  } catch (error) {
    // Annulation volontaire (changement de page, nouvelle recherche) : on relaie tel quel.
    if (signal?.aborted) throw error
    if (timeoutSignal.aborted) {
      throw new ApiError(0, 'TIMEOUT', 'Le serveur met trop de temps à répondre.')
    }
    throw new ApiError(0, 'NETWORK', 'Impossible de joindre le serveur.')
  }

  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const parsed = apiErrorBodySchema.safeParse(payload)
    const code =
      parsed.success && KNOWN_CODES.has(parsed.data.code)
        ? (parsed.data.code as ApiErrorCode)
        : codeFromStatus(response.status)
    const message = parsed.success ? parsed.data.message : `Erreur ${response.status}`
    throw new ApiError(response.status, code, message)
  }

  const parsed = schema.safeParse(payload)
  if (!parsed.success) {
    if (import.meta.env.DEV && import.meta.env.MODE !== 'test') console.error('[api] Contrat non respecté', path, parsed.error.issues)
    throw new ApiError(response.status, 'INVALID_RESPONSE', 'Réponse du serveur inattendue.')
  }
  return parsed.data
}

/** Message affichable à l'utilisateur, avec une piste pour s'en sortir. */
export function getErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Une erreur inattendue est survenue. Réessayez.'
  switch (error.code) {
    case 'NETWORK':
      return 'Connexion impossible. Vérifiez votre réseau puis réessayez.'
    case 'TIMEOUT':
      return 'Le service répond lentement. Réessayez dans quelques instants.'
    case 'NOT_FOUND':
      return "Ce trajet n'existe plus. Relancez votre recherche."
    case 'SOLD_OUT':
      return 'Plus de places disponibles dans cette classe. Choisissez un autre trajet ou une autre classe.'
    case 'VALIDATION':
      return 'Certaines informations sont incorrectes. Vérifiez le formulaire.'
    case 'INVALID_RESPONSE':
    case 'SERVER':
      return 'Le service est momentanément indisponible. Réessayez dans quelques instants.'
  }
}
