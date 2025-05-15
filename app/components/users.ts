'use server'

import { prisma } from '@/lib/prisma'

export async function fetchUtilisateurs() {
  const users = await prisma.utilisateur.findMany({
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  })

  return users.map(user => ({
    ...user,
    id: String(user.id),
  }))
}
