import { z } from 'zod'

export const createBudgetCategorySchema = z.object({
  trip_id: z.string().uuid(),
  name: z.string().min(2, 'Category name is required').max(100),
  estimated_cost: z.number().min(0, 'Cost must be positive'),
  split_type: z.enum(['equal', 'custom', 'none']).default('equal'),
  description: z.string().max(500).optional(),
  sort_order: z.number().int().default(0),
})

export const updateBudgetCategorySchema = createBudgetCategorySchema.partial().omit({ trip_id: true })

export const createBudgetSplitSchema = z.object({
  category_id: z.string().uuid(),
  user_id: z.string().uuid(),
  amount: z.number().min(0),
})

export type CreateBudgetCategoryInput = z.infer<typeof createBudgetCategorySchema>
export type UpdateBudgetCategoryInput = z.infer<typeof updateBudgetCategorySchema>
export type CreateBudgetSplitInput = z.infer<typeof createBudgetSplitSchema>
