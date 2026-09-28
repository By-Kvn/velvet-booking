import type { ComponentProps, MouseEvent } from 'react'
import { Spinner } from './Spinner'
import styles from './Button.module.css'

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'ghost'
  /** Affiche un indicateur et bloque les doubles clics (paiement, réservation). */
  loading?: boolean
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  loading = false,
  fullWidth = false,
  type = 'button',
  className,
  onClick,
  children,
  ...rest
}: ButtonProps) {
  const classes = [styles.button, styles[variant], fullWidth && styles.fullWidth, className]
    .filter(Boolean)
    .join(' ')

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    // Pendant le chargement, on bloque l'action (et la soumission du formulaire)
    // sans utiliser disabled : le bouton garde le focus clavier.
    if (loading) {
      event.preventDefault()
      return
    }
    onClick?.(event)
  }

  return (
    <button
      {...rest}
      type={type}
      className={classes}
      aria-disabled={loading || rest['aria-disabled'] || undefined}
      aria-busy={loading || undefined}
      onClick={handleClick}
    >
      {loading && <Spinner size="sm" label="Traitement en cours" />}
      <span>{children}</span>
    </button>
  )
}
