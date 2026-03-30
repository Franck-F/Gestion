import { z } from 'zod'

export const createEventSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().nullable().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().nullable().optional(),
  allDay: z.boolean().optional(),
  color: z.string().nullable().optional(),
  source: z.enum(['MANUAL', 'CANDIDATURE', 'BOURSE', 'OBJECTIVE', 'DOCUMENT']).optional(),
  sourceId: z.string().nullable().optional(),
  reminder: z.string().datetime().nullable().optional(),
})

export const updateEventSchema = createEventSchema.partial()
