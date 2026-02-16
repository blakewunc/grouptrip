import { z } from 'zod'

export const addMemberSchema = z.object({
  email: z.string().email('Valid email required'),
  name: z.string().min(1).max(100).optional(),
})

export const updateMemberSchema = z.object({
  role: z.enum(['organizer', 'member']).optional(),
  budget_cap: z.number().min(0).nullable().optional(),
})

export const setBudgetCapSchema = z.object({
  budget_cap: z.number().min(0).nullable(),
})

export type AddMemberInput = z.infer<typeof addMemberSchema>
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>
export type SetBudgetCapInput = z.infer<typeof setBudgetCapSchema>
