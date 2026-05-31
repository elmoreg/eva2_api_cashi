import type { Context, Next } from 'hono'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret'

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'No autorizado, token requerido' }, 401)
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    // Guardar la información del usuario en el contexto
    c.set('user', decoded)
    await next()
  } catch (error) {
    return c.json({ error: 'Token inválido o expirado' }, 401)
  }
}
