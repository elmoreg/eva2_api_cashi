import * as z from 'zod'

export const createTransactionSchema = z.object({
  amount:      z.number().positive(),
  type:        z.enum(['income', 'expense']),
  description: z.string().max(255).optional(),
  date:        z.string().datetime().or(z.date()), // accepts ISO string or Date object
  categoryId:  z.number().int().positive(),
})

export const updateTransactionSchema = z.object({
  amount:      z.number().positive().optional(),
  type:        z.enum(['income', 'expense']).optional(),
  description: z.string().max(255).optional(),
  date:        z.string().datetime().or(z.date()).optional(),
  categoryId:  z.number().int().positive().optional(),
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
