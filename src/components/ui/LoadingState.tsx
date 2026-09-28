import { Spinner } from './Spinner'
import styles from './LoadingState.module.css'

type LoadingStateProps = {
  label: string
  /** Une tentative a déjà échoué : on le dit plutôt que de laisser tourner un spinner muet. */
  retrying?: boolean
}

export function LoadingState({ label, retrying = false }: LoadingStateProps) {
  return (
    <div className={styles.loading}>
      <Spinner label={label} />
      <div>
        <p className={styles.label} aria-hidden="true">
          {label}…
        </p>
        {retrying && (
          <p role="status" className={styles.retry}>
            Le réseau est lent. Nouvelle tentative en cours.
          </p>
        )}
      </div>
    </div>
  )
}
