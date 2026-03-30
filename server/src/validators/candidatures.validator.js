import { z } from 'zod'

export const createCandidatureSchema = z.object({
  companyName: z.string().min(1, 'Le nom de l\'entreprise est requis'),
  jobTitle: z.string().min(1, 'L\'intitulé du poste est requis'),
  jobUrl: z.string().url().nullable().optional(),
  location: z.string().nullable().optional(),
  status: z.enum(['A_POSTULER', 'POSTULE', 'RELANCE', 'ENTRETIEN', 'OFFRE', 'REFUS']).optional(),
  appliedAt: z.string().datetime().nullable().optional(),
  nextFollowUp: z.string().datetime().nullable().optional(),
  salary: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
})

export const updateCandidatureSchema = createCandidatureSchema.partial()

export const updateStatusSchema = z.object({
  status: z.enum(['A_POSTULER', 'POSTULE', 'RELANCE', 'ENTRETIEN', 'OFFRE', 'REFUS']),
})

export const createContactSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  role: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  linkedinUrl: z.string().url().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export const updateContactSchema = createContactSchema.partial()
