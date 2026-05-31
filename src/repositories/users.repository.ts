import { prisma } from '../lib/prisma.js'
import type { Prisma } from '../../generated/client/client.js'

export const usersRepository = {
  findByEmail: (email: string) => {
    return prisma.user.findUnique({
      where: { email }
    })
  },

  findById: (id: number) => {
    return prisma.user.findUnique({
      where: { id }
    })
  },

  create: (data: Prisma.UserCreateInput) => {
    return prisma.user.create({
      data
    })
  }
}
