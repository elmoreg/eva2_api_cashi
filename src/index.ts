import 'dotenv/config'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import categoriesRouter from './routes/categories.routes.js'
import transactionsRouter from './routes/transactions.routes.js'
import authRouter from './routes/auth.routes.js'
import { authMiddleware } from './lib/auth.middleware.js'

const app = new Hono()

// Middleware globales
app.use('*', logger())

// Rutas públicas
app.get('/', (c) => c.text('Cashi API - Personal Finance Backend'))
app.route('/auth', authRouter)

// Proteger el resto de las rutas con JWT
app.use('/categories/*', authMiddleware)
app.use('/transactions/*', authMiddleware)

app.route('/categories', categoriesRouter)
app.route('/transactions', transactionsRouter)

// Servidor
const port = Number(process.env.PORT) || 3000

console.log(`🚀 Servidor corriendo en http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})

export default app
