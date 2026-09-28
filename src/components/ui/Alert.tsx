import type { ReactNode } from 'react'
import styles from './Alert.module.css'

type AlertProps = {
  tone?: 'info' | 'success' | 'warning' | 'error'
  title: string
  children?: ReactNode
  /** Action de récupération, ex. un bouton « Réessayer ». */
  action?: ReactNode
}

export function Alert({ tone = 'info', title, children, action }: AlertProps) {
  // Les erreurs interrompent le lecteur d'écran, le reste est annoncé poliment.
  const role = tone === 'error' ? 'alert' : 'status'

  return (
    <div role={role} className={`${styles.alert} ${styles[tone]}`}>
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        {children && <div className={styles.body}>{children}</div>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
