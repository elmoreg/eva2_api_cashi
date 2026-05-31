import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('El formato del email es inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
})

export const loginSchema = z.object({
  email: z.string().email('El formato del email es inválido'),
  password: z.string().min(1, 'La contraseña es requerida')
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
