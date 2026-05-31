import { prisma } from '../lib/prisma.js'
import { Prisma } from '../../generated/client/client.js'
import type { CreateTransactionInput, UpdateTransactionInput } from '../schemas/transactions.schema.js'
import type { Transaction } from '../../generated/client/client.js'

export type TransactionWithCategory = Prisma.TransactionGetPayload<{
  include: { category: true }
}>

interface TransactionRepository {
  findAll: (userId: number) => Promise<TransactionWithCategory[]>
  findById: (id: number) => Promise<TransactionWithCategory | null>
  create: (data: CreateTransactionInput, userId: number) => Promise<Transaction>
  update: (id: number, data: UpdateTransactionInput) => Promise<Transaction>
  remove: (id: number) => Promise<void>
}

export const transactionsRepository: TransactionRepository = {
  findAll: (userId) =>
    prisma.transaction.findMany({
      where: { userId },
      include: { category: true }
    }),

  findById: (id) =>
    prisma.transaction.findUnique({
      where: { id },
      include: { category: true }
    }),

  create: (data, userId) =>
    prisma.transaction.create({ 
      data: {
        ...data,
        date: new Date(data.date),
        userId
      } 
    }),

  update: (id, data) =>
    prisma.transaction.update({ 
      where: { id }, 
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined
      }
    }),

  remove: (id) =>
    prisma.transaction.delete({ where: { id } }).then(() => undefined)
}
