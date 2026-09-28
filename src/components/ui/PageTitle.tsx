import type { ReactNode } from 'react'
import styles from './PageTitle.module.css'

type PageTitleProps = {
  children: ReactNode
  className?: string
}

/**
 * Le <h1> unique de la page. tabIndex={-1} permet au layout d'y déplacer le focus
 * à chaque navigation, pour que le lecteur d'écran annonce la nouvelle page.
 */
export function PageTitle({ children, className }: PageTitleProps) {
  return (
    <h1 tabIndex={-1} className={[styles.title, className].filter(Boolean).join(' ')}>
      {children}
    </h1>
  )
}
