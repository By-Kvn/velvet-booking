import { useId, type ComponentProps } from 'react'
import styles from './Field.module.css'

type TextFieldProps = ComponentProps<'input'> & {
  label: string
  hint?: string
  error?: string
}

/**
 * Champ texte accessible : label relié, aide et erreur annoncées via aria-describedby.
 * Compatible react-hook-form : register() passe ref, name, onChange et onBlur.
 */
export function TextField({ label, hint, error, id, className, ...rest }: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const hintId = hint ? `${inputId}-hint` : undefined
  const errorId = error ? `${inputId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      {hint && (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      )}
      <input
        {...rest}
        id={inputId}
        className={styles.control}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      />
      {error && (
        <span id={errorId} className={styles.error}>
          {error}
        </span>
      )}
    </div>
  )
}
