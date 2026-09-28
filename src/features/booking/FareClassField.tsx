import type { UseFormRegisterReturn } from 'react-hook-form'
import type { Fare } from '../../api/types'
import { formatPrice } from '../../lib/format'
import { FARE_CLASS_LABELS, getFareAvailability } from '../trips/fareAvailability'
import styles from './BookingForm.module.css'

type FareClassFieldProps = {
  fares: Fare[]
  passengers: number
  registration: UseFormRegisterReturn<'fareClass'>
}

/** Boutons radio natifs dans un fieldset : groupe annoncé, flèches du clavier, aucun JavaScript d'accessibilité à écrire. */
export function FareClassField({ fares, passengers, registration }: FareClassFieldProps) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>Classe</legend>
      <div className={styles.options}>
        {fares.map((fare) => {
          const availability = getFareAvailability(fare, passengers)
          const bookable = availability.status === 'available' || availability.status === 'low'
          return (
            <label key={fare.fareClass} className={`${styles.option} ${bookable ? '' : styles.optionDisabled}`}>
              <input type="radio" value={fare.fareClass} disabled={!bookable} {...registration} />
              <span className={styles.optionText}>
                <span className={styles.optionTitle}>{FARE_CLASS_LABELS[fare.fareClass]}</span>
                <span>{formatPrice(fare.priceCents)} par voyageur</span>
                {!bookable && <span className={styles.optionNote}>Complet pour {passengers > 1 ? 'votre groupe' : 'ce train'}</span>}
                {availability.status === 'low' && (
                  <span className={styles.optionWarning}>Plus que {availability.seatsLeft} places</span>
                )}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
