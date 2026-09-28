import { useId, type ComponentProps } from 'react'
import styles from './Field.module.css'

export type SelectOption = { value: string; label: string; disabled?: boolean }

type SelectProps = ComponentProps<'select'> & {
  label: string
  options: SelectOption[]
  placeholder?: string
  hint?: string
  error?: string
}

/** Select natif : meilleur support clavier, mobile et lecteurs d'écran qu'un select custom. */
export function Select({ label, options, placeholder, hint, error, id, className, ...rest }: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const hintId = hint ? `${selectId}-hint` : undefined
  const errorId = error ? `${selectId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <label htmlFor={selectId} className={styles.label}>
        {label}
      </label>
      {hint && (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      )}
      <select
        {...rest}
        id={selectId}
        className={styles.control}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span id={errorId} className={styles.error}>
          {error}
        </span>
      )}
    </div>
  )
}
