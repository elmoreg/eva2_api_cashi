import 'dotenv/config'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import categoriesRouter from './routes/categories.routes.js'
import transactionsRouter from './routes/transactions.routes.js'

const app = new Hono()

// Middleware
app.use('*', logger())

// Rutas
app.get('/', (c) => c.text('Cashi API - Personal Finance Backend'))

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
