import { z } from 'zod'

export const createTripSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  destination: z.string().min(2, 'Destination is required').max(100),
  start_date: z.string().refine((date) => {
    const d = new Date(date)
    return d > new Date()
  }, 'Start date must be in the future'),
  end_date: z.string(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  budget_total: z.number().min(0).optional(),
}).refine((data) => {
  const start = new Date(data.start_date)
  const end = new Date(data.end_date)
  return end >= start
}, {
  message: 'End date must be after start date',
  path: ['end_date'],
})

export const updateTripSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters').optional(),
  destination: z.string().min(2, 'Destination is required').max(100).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  budget_total: z.number().min(0).optional(),
  status: z.enum(['planning', 'confirmed', 'completed', 'cancelled']).optional(),
  trip_type: z.enum(['general', 'golf', 'ski', 'bachelor_party', 'bachelorette_party']).optional(),
  proposal_enabled: z.boolean().optional(),
})

export const joinTripSchema = z.object({
  invite_code: z.string().min(8, 'Invalid invite code'),
  rsvp_status: z.enum(['pending', 'accepted', 'declined', 'maybe']).default('accepted'),
})

export type CreateTripInput = z.infer<typeof createTripSchema>
export type UpdateTripInput = z.infer<typeof updateTripSchema>
export type JoinTripInput = z.infer<typeof joinTripSchema>
