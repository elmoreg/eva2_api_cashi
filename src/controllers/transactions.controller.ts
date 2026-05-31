import type { Context } from 'hono'
import { transactionsRepository } from '../repositories/transactions.repository.js'
import { createTransactionSchema, updateTransactionSchema } from '../schemas/transactions.schema.js'
import { parsePrismaError } from '../lib/prisma-errors.js'

export const getTransactions = async (c: Context) => {
  const user = c.get('user')
  const transactions = await transactionsRepository.findAll(user.userId)
  return c.json(transactions)
}

export const getTransactionById = async (c: Context) => {
  const id = Number(c.req.param('id'))
  const user = c.get('user')
  const transaction = await transactionsRepository.findById(id)
  
  if (!transaction) return c.json({ error: 'Transacción no encontrada' }, 404)
  if (transaction.userId !== user.userId) return c.json({ error: 'No autorizado' }, 403)
  
  return c.json(transaction)
}

export const createTransaction = async (c: Context) => {
  const body = await c.req.json()
  const user = c.get('user')
  const result = createTransactionSchema.safeParse(body)
  if (!result.success) return c.json({ errors: result.error.issues }, 400)
  
  try {
    const transaction = await transactionsRepository.create(result.data, user.userId)
    return c.json(transaction, 201)
  } catch (error) {
    const { status, message } = parsePrismaError(error)
    return c.json({ error: message }, status as any)
  }
}

export const updateTransaction = async (c: Context) => {
  const id = Number(c.req.param('id'))
  const user = c.get('user')
  const body = await c.req.json()
  
  const existing = await transactionsRepository.findById(id)
  if (!existing) return c.json({ error: 'Transacción no encontrada' }, 404)
  if (existing.userId !== user.userId) return c.json({ error: 'No autorizado' }, 403)

  const result = updateTransactionSchema.safeParse(body)
  if (!result.success) return c.json({ errors: result.error.issues }, 400)
  
  try {
    const transaction = await transactionsRepository.update(id, result.data)
    return c.json(transaction)
  } catch (error) {
    const { status, message } = parsePrismaError(error)
    return c.json({ error: message }, status as any)
  }
}

export const deleteTransaction = async (c: Context) => {
  const id = Number(c.req.param('id'))
  const user = c.get('user')
  
  const existing = await transactionsRepository.findById(id)
  if (!existing) return c.json({ error: 'Transacción no encontrada' }, 404)
  if (existing.userId !== user.userId) return c.json({ error: 'No autorizado' }, 403)

  try {
    await transactionsRepository.remove(id)
    return c.json({ message: 'Transacción eliminada' })
  } catch (error) {
    const { status, message } = parsePrismaError(error)
    return c.json({ error: message }, status as any)
  }
}

export const getBalance = async (c: Context) => {
  const user = c.get('user')
  const transactions = await transactionsRepository.findAll(user.userId)
  
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0)
    
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0)
    
  const balance = totalIncome - totalExpense
  
  return c.json({
    totalIncome,
    totalExpense,
    balance
  })
}
