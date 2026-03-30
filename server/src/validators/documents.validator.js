import { z } from 'zod'

export const createDocumentSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  category: z.string().nullable().optional(),
  status: z.enum(['A_FAIRE', 'EN_COURS', 'PRET']).optional(),
  notes: z.string().nullable().optional(),
})

export const updateDocumentSchema = createDocumentSchema.partial()
