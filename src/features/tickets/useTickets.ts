import { useSyncExternalStore } from 'react'
import { getTickets, subscribeTickets } from './ticketStorage'

export function useTickets() {
  return useSyncExternalStore(subscribeTickets, getTickets)
}
