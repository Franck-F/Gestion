import { z } from 'zod'

export const createObjectiveSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().nullable().optional(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED']).optional(),
  targetDate: z.string().datetime().nullable().optional(),
  category: z.string().nullable().optional(),
  specific: z.string().nullable().optional(),
  measurable: z.string().nullable().optional(),
  achievable: z.string().nullable().optional(),
  relevant: z.string().nullable().optional(),
  timeBound: z.string().nullable().optional(),
})

export const updateObjectiveSchema = createObjectiveSchema.partial()

export const createMilestoneSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  sortOrder: z.number().int().optional(),
})

export const updateMilestoneSchema = z.object({
  title: z.string().min(1).optional(),
  completed: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
})

export const reorderMilestonesSchema = z.object({
  milestoneIds: z.array(z.string().uuid()),
})
