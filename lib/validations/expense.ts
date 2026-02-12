import { z } from 'zod'

export const createExpenseSchema = z.object({
  trip_id: z.string().uuid(),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  description: z.string().min(3, 'Description is required').max(200),
  category: z.string().max(50).optional(),
  date: z.string().default(new Date().toISOString().split('T')[0]),
})

export const updateExpenseSchema = createExpenseSchema.partial().omit({ trip_id: true })

export const createExpenseSplitSchema = z.object({
  expense_id: z.string().uuid(),
  user_id: z.string().uuid(),
  amount: z.number().min(0),
})

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>
export type CreateExpenseSplitInput = z.infer<typeof createExpenseSplitSchema>
