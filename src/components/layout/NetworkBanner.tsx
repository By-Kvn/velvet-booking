import { onlineManager } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import styles from './Layout.module.css'

const BACK_ONLINE_DURATION_MS = 4000

/**
 * Bannière réseau, toujours présente dans le DOM : une région live qui existe avant son contenu
 * est annoncée de façon fiable par les lecteurs d'écran, dans les deux sens (perte et retour).
 */
export function NetworkBanner() {
  const online = useOnlineStatus()
  const [backOnline, setBackOnline] = useState(false)

  // « Connexion rétablie » réagit à l'événement réseau lui-même, puis s'efface.
  useEffect(() => {
    let wasOnline = onlineManager.isOnline()
    let timer: number | undefined
    const unsubscribe = onlineManager.subscribe((isOnline) => {
      window.clearTimeout(timer)
      setBackOnline(isOnline && !wasOnline)
      if (isOnline && !wasOnline) {
        timer = window.setTimeout(() => setBackOnline(false), BACK_ONLINE_DURATION_MS)
      }
      wasOnline = isOnline
    })
    return () => {
      unsubscribe()
      window.clearTimeout(timer)
    }
  }, [])

  return (
    <div role="status">
      {!online && (
        <p className={`${styles.network} ${styles.offline}`}>
          <strong>Vous êtes hors ligne.</strong> Vos <Link to="/billets">billets</Link> restent consultables. La
          recherche et la réservation reprendront au retour du réseau.
        </p>
      )}
      {online && backOnline && <p className={`${styles.network} ${styles.online}`}>Connexion rétablie.</p>}
    </div>
  )
}
