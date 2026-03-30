import { z } from 'zod'

export const createBourseSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  organism: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  amount: z.number().positive().nullable().optional(),
  status: z.enum(['RECHERCHE', 'ELIGIBLE', 'DOSSIER_EN_COURS', 'SOUMIS', 'ACCEPTE', 'REFUSE']).optional(),
  eligibility: z.string().nullable().optional(),
  applicationUrl: z.string().url().nullable().optional(),
  deadline: z.string().datetime().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export const updateBourseSchema = createBourseSchema.partial()

export const createBourseDocSchema = z.object({
  name: z.string().min(1, 'Le nom du document est requis'),
  status: z.enum(['A_FAIRE', 'EN_COURS', 'PRET']).optional(),
  notes: z.string().nullable().optional(),
})

export const updateBourseDocSchema = createBourseDocSchema.partial()
