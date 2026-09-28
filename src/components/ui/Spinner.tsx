import styles from './Spinner.module.css'

type SpinnerProps = {
  /** Texte annoncé aux lecteurs d'écran. */
  label?: string
  size?: 'sm' | 'md'
}

export function Spinner({ label = 'Chargement', size = 'md' }: SpinnerProps) {
  return (
    <span role="status" className={styles.wrapper}>
      <span className={`${styles.spinner} ${styles[size]}`} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  )
}
