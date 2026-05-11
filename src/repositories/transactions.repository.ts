import { prisma } from '../lib/prisma.js'
import { Prisma } from '../../generated/client/client.js'
import type { CreateTransactionInput, UpdateTransactionInput } from '../schemas/transactions.schema.js'
import type { Transaction } from '../../generated/client/client.js'

export type TransactionWithCategory = Prisma.TransactionGetPayload<{
  include: { category: true }
}>

interface TransactionRepository {
  findAll: () => Promise<TransactionWithCategory[]>
  findById: (id: number) => Promise<TransactionWithCategory | null>
  create: (data: CreateTransactionInput) => Promise<Transaction>
  update: (id: number, data: UpdateTransactionInput) => Promise<Transaction>
  remove: (id: number) => Promise<void>
}

export const transactionsRepository: TransactionRepository = {
  findAll: () =>
    prisma.transaction.findMany({
      include: { category: true }
    }),

  findById: (id) =>
    prisma.transaction.findUnique({
      where: { id },
      include: { category: true }
    }),

  create: (data) =>
    prisma.transaction.create({ 
      data: {
        ...data,
        date: new Date(data.date)
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
