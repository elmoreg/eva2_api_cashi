import type { Context } from 'hono'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { usersRepository } from '../repositories/users.repository.js'
import { registerSchema, loginSchema } from '../schemas/auth.schema.js'

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret'

export const register = async (c: Context) => {
  const body = await c.req.json()
  const result = registerSchema.safeParse(body)
  
  if (!result.success) {
    return c.json({ errors: result.error.issues }, 400)
  }

  const { email, password } = result.data

  // Verificar si el usuario ya existe
  const existingUser = await usersRepository.findByEmail(email)
  if (existingUser) {
    return c.json({ error: 'El usuario ya está registrado' }, 400)
  }

  // Hashear contraseña
  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash(password, salt)

  // Crear usuario
  const newUser = await usersRepository.create({
    email,
    passwordHash
  })

  // Generar JWT
  const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' })

  return c.json({ token }, 201)
}

export const login = async (c: Context) => {
  const body = await c.req.json()
  const result = loginSchema.safeParse(body)
  
  if (!result.success) {
    return c.json({ errors: result.error.issues }, 400)
  }

  const { email, password } = result.data

  // Buscar usuario
  const user = await usersRepository.findByEmail(email)
  if (!user) {
    return c.json({ error: 'Credenciales inválidas' }, 401)
  }

  // Verificar contraseña
  const isValidPassword = await bcrypt.compare(password, user.passwordHash)
  if (!isValidPassword) {
    return c.json({ error: 'Credenciales inválidas' }, 401)
  }

  // Generar JWT
  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })

  return c.json({ token })
}
