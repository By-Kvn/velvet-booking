import { Link, type LinkProps } from 'react-router-dom'
import styles from './Button.module.css'

type ButtonLinkProps = LinkProps & {
  variant?: 'primary' | 'secondary' | 'ghost'
  fullWidth?: boolean
}

/** Une navigation reste un lien (clic molette, « ouvrir dans un onglet »), même quand elle ressemble à un bouton. */
export function ButtonLink({ variant = 'primary', fullWidth = false, className, ...rest }: ButtonLinkProps) {
  const classes = [styles.button, styles[variant], fullWidth && styles.fullWidth, className]
    .filter(Boolean)
    .join(' ')
  return <Link {...rest} className={classes} />
}
