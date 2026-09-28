import { LoadingState } from '../../components/ui'
import styles from './TripListSkeleton.module.css'

/** Squelette de chargement : la mise en page ne saute pas quand les résultats arrivent. */
export function TripListSkeleton({ retrying = false }: { retrying?: boolean }) {
  return (
    <div className={styles.wrapper}>
      <LoadingState label="Recherche des trajets en cours" retrying={retrying} />
      <ul className={styles.list} aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <li key={index} className={styles.card}>
            <span className={`${styles.bar} ${styles.wide}`} />
            <span className={styles.bar} />
            <span className={`${styles.bar} ${styles.block}`} />
          </li>
        ))}
      </ul>
    </div>
  )
}
