import { z } from 'zod'

export const createNoteSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  content: z.string().min(1, 'Le contenu est requis'),
  type: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  candidatureId: z.string().uuid().nullable().optional(),
  isPinned: z.boolean().optional(),
})

export const updateNoteSchema = createNoteSchema.partial()
