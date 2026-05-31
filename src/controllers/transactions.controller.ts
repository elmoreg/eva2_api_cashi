import type { Context } from 'hono'
import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'
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

export const uploadReceipt = async (c: Context) => {
  try {
    const body = await c.req.parseBody()
    const file = body['receipt']

    if (!(file instanceof File)) {
      return c.json({ error: 'Archivo no válido o no se encontró el campo receipt' }, 400)
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedMimeTypes.includes(file.type)) {
      return c.json({ error: 'Solo se permiten imágenes JPEG, PNG o WebP' }, 400)
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      return c.json({ error: 'El archivo excede el tamaño máximo de 5MB' }, 400)
    }

    const ext = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${ext}`
    const uploadPath = path.join(process.cwd(), 'uploads', fileName)

    const buffer = await file.arrayBuffer()
    await fs.writeFile(uploadPath, Buffer.from(buffer))

    // Asumimos que la URL base se obtiene de alguna manera, aquí usamos una genérica o el request url original
    const url = new URL(c.req.url)
    const receiptUrl = `${url.protocol}//${url.host}/uploads/${fileName}`

    return c.json({ receiptUrl }, 201)
  } catch (error) {
    return c.json({ error: 'Error al subir el archivo' }, 500)
  }
}
