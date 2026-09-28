import { z } from 'zod'
import { fareClassSchema } from '../../api/schemas'

const passengerFieldsSchema = z.object({
  firstName: z.string().trim().min(1, 'Saisissez le prénom.'),
  lastName: z.string().trim().min(1, 'Saisissez le nom.'),
})

export const bookingFormSchema = z.object({
  fareClass: fareClassSchema,
  passengers: z.array(passengerFieldsSchema).min(1),
  email: z
    .string()
    .trim()
    .min(1, 'Saisissez votre adresse e-mail.')
    .pipe(z.email('Saisissez une adresse e-mail valide, par exemple nom@exemple.fr')),
})

export type BookingFormValues = z.infer<typeof bookingFormSchema>
