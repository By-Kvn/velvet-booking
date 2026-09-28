import { bookingSchema } from '../../api/schemas'
import type { Booking } from '../../api/types'

/** Version dans la clé : un changement de format futur n'essaiera pas de relire l'ancien. */
const STORAGE_KEY = 'velvet:tickets:v1'
const listeners = new Set<() => void>()

let cachedRaw: string | null = null
let cachedTickets: Booking[] = []

function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    // Stockage bloqué (navigation privée stricte) : aucun billet local.
    return null
  }
}

/**
 * Le localStorage est une donnée non fiable : modifiable à la main, ancienne version de l'app, écriture interrompue.
 * Chaque billet est revalidé avec le contrat Zod ; un billet corrompu est écarté sans faire tomber les autres.
 */
export function parseTickets(raw: string | null): Booking[] {
  if (!raw) return []
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return []
  }
  if (!Array.isArray(data)) return []
  return data.flatMap((item) => {
    const parsed = bookingSchema.safeParse(item)
    return parsed.success ? [parsed.data] : []
  })
}

/** Instantané stable tant que le stockage ne change pas (exigé par useSyncExternalStore). */
export function getTickets(): Booking[] {
  const raw = readRaw()
  if (raw !== cachedRaw) {
    cachedRaw = raw
    cachedTickets = parseTickets(raw)
  }
  return cachedTickets
}

export function saveTicket(booking: Booking): boolean {
  const tickets = [booking, ...getTickets().filter((ticket) => ticket.id !== booking.id)]
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets))
  } catch {
    // Quota dépassé ou stockage bloqué : la réservation existe côté serveur, seule la copie locale manque.
    return false
  }
  listeners.forEach((listener) => listener())
  return true
}

export function getTicket(id: string): Booking | undefined {
  return getTickets().find((ticket) => ticket.id === id)
}

export function subscribeTickets(listener: () => void): () => void {
  listeners.add(listener)
  // Un billet acheté dans un autre onglet apparaît aussi ici.
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

export const TICKETS_STORAGE_KEY = STORAGE_KEY
