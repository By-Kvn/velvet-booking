import { z } from 'zod'
import { MAX_PASSENGERS } from './searchCriteria'

/** Règles du formulaire. `today` est injecté pour que la validation soit testable à date fixe. */
export function createSearchFormSchema(today: string) {
  return z
    .object({
      from: z.string().min(1, 'Choisissez une gare de départ.'),
      to: z.string().min(1, "Choisissez une gare d'arrivée."),
      date: z.string().min(1, 'Choisissez une date de départ.'),
      passengers: z.string(),
    })
    .superRefine((values, ctx) => {
      if (values.from && values.to && values.from === values.to) {
        ctx.addIssue({
          code: 'custom',
          path: ['to'],
          message: "Choisissez une gare d'arrivée différente de la gare de départ.",
        })
      }
      if (values.date && values.date < today) {
        ctx.addIssue({ code: 'custom', path: ['date'], message: "Choisissez une date à partir d'aujourd'hui." })
      }
      const passengers = Number(values.passengers)
      if (!Number.isInteger(passengers) || passengers < 1 || passengers > MAX_PASSENGERS) {
        ctx.addIssue({
          code: 'custom',
          path: ['passengers'],
          message: `Choisissez entre 1 et ${MAX_PASSENGERS} voyageurs.`,
        })
      }
    })
}

export type SearchFormValues = z.infer<ReturnType<typeof createSearchFormSchema>>
