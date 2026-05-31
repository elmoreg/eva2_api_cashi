import { z } from 'zod'

export const createTransactionSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['income', 'expense']),
  description: z.string().optional(),
  date: z.string().datetime(),
  categoryId: z.number().positive(),
  receiptUrl: z.string().url().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
})

export const updateTransactionSchema = createTransactionSchema.partial()

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
