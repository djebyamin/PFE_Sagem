import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return new NextResponse('Non autorisé', { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return new NextResponse('Token invalide', { status: 401 })
    }

    const users = await prisma.utilisateur.findMany({
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        image: true,
        roles: {
          select: {
            role: {
              select: {
                nom: true
              }
            }
          }
        }
      }
    })

    const formattedUsers = users.map(user => ({
      id: user.id.toString(),
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      image: user.image,
      roles: user.roles.map(r => ({ nom: r.role.nom }))
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    return new NextResponse('Erreur interne du serveur', { status: 500 })
  }
} 