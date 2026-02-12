import { z } from 'zod'

export const createItineraryItemSchema = z.object({
  trip_id: z.string().uuid(),
  date: z.string(), // ISO date string
  time: z.string().optional(), // HH:mm format
  title: z.string().min(3, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  location: z.string().max(200).optional(),
  sort_order: z.number().int().default(0),
})

export const updateItineraryItemSchema = createItineraryItemSchema.partial().omit({ trip_id: true })

export const createCommentSchema = z.object({
  itinerary_item_id: z.string().uuid(),
  text: z.string().min(1, 'Comment cannot be empty').max(500, 'Comment must be less than 500 characters'),
})

export const updateCommentSchema = z.object({
  text: z.string().min(1, 'Comment cannot be empty').max(500),
})

export type CreateItineraryItemInput = z.infer<typeof createItineraryItemSchema>
export type UpdateItineraryItemInput = z.infer<typeof updateItineraryItemSchema>
export type CreateCommentInput = z.infer<typeof createCommentSchema>
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>
