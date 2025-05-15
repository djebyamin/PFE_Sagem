import { prisma } from '@/lib/prisma'

export async function getUsers() {
  try {
    const users = await prisma.utilisateur.findMany({
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        image: true,
        roles: {
          select: { role: { select: { nom: true } } }
        }
      }
    })

    return users
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs :', error)
    throw error
  }
}
