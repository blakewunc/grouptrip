import { z } from 'zod'

export const createSuggestionSchema = z.object({
  title: z.string().min(1, 'Title required').max(200),
  description: z.string().max(1000).optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  location: z.string().max(200).optional(),
})

export const updateSuggestionStatusSchema = z.object({
  status: z.enum(['approved', 'rejected']),
})

export type CreateSuggestionInput = z.infer<typeof createSuggestionSchema>
