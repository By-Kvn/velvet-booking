import { onlineManager } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'

// Défini hors du hook : une référence stable évite de se réabonner à chaque rendu.
const subscribe = (onChange: () => void) => onlineManager.subscribe(onChange)
const getSnapshot = () => onlineManager.isOnline()

/**
 * Une seule source de vérité pour l'état du réseau : celle de React Query,
 * qui met déjà les requêtes en pause hors ligne. L'interface et le cache ne peuvent pas se contredire.
 */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot)
}
